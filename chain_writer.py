import hashlib
import json
import os
import time
import logging
import uuid
from web3 import Web3
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv(os.path.join(os.path.dirname(__file__), "atlas-chain", ".env"))

RPC_URL = os.getenv("SEPOLIA_RPC_URL")
PRIVATE_KEY = os.getenv("DEPLOYER_PRIVATE_KEY")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")

# 初始化全域 Web3 變數
w3 = None
account = None
contract = None
use_fallback = False

def init_web3():
    global w3, account, contract, use_fallback
    if use_fallback:
        return
        
    try:
        if not RPC_URL or not PRIVATE_KEY or not CONTRACT_ADDRESS:
            logger.warning("⚠️ [防翻車機制] 未偵測到完整的 Web3 環境變數 (.env)，啟用本地模擬上鏈模式。")
            use_fallback = True
            return

        with open(os.path.join(os.path.dirname(__file__), "AuditRegistryABI.json")) as f:
            CONTRACT_ABI = json.load(f)

        w3 = Web3(Web3.HTTPProvider(RPC_URL))
        account = w3.eth.account.from_key(PRIVATE_KEY)
        # 抓取 ABI 裡面的 abi 陣列 (Hardhat artifact 結構)
        abi = CONTRACT_ABI.get("abi", CONTRACT_ABI)
        contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=abi)
        logger.info("✅ 成功連線至 Web3 RPC，真實區塊鏈存證模組啟動。")
    except Exception as e:
        logger.error(f"⚠️ [防翻車機制] Web3 初始化失敗: {e}，啟用本地模擬上鏈模式。")
        use_fallback = True

# 啟動時自動初始化
init_web3()


def compute_hash(decision_dict: dict) -> bytes:
    """將決策 JSON 序列化並計算 SHA-256, 回傳 32 bytes 供合約使用"""
    canonical_str = json.dumps(decision_dict, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(canonical_str.encode("utf-8")).digest()  # 32 bytes


def record_decision_on_chain(decision_id: str, decision_dict: dict) -> dict:
    """
    將決策上鏈存證。
    回傳 tx_hash、區塊高度、上鏈用的 content_hash(供資料庫留存與之後驗證)
    """
    content_hash = compute_hash(decision_dict)
    
    if use_fallback:
        # 黑客松防翻車模擬模式
        time.sleep(1.5) # 模擬網路延遲
        mock_tx_hash = "0x" + hashlib.md5(uuid.uuid4().bytes).hexdigest() + hashlib.md5(uuid.uuid4().bytes).hexdigest()
        logger.info(f"✅ [模擬模式] 決策指紋已成功上鏈！TxHash: {mock_tx_hash}")
        return {
            "decision_id": decision_id,
            "content_hash_hex": content_hash.hex(),
            "tx_hash": mock_tx_hash,
            "block_number": 9999999,
            "etherscan_url": f"https://sepolia.etherscan.io/tx/{mock_tx_hash}",
            "is_mock": True
        }

    try:
        nonce = w3.eth.get_transaction_count(account.address)
        txn = contract.functions.recordDecision(decision_id, content_hash).build_transaction({
            "from": account.address,
            "nonce": nonce,
            # EIP-1559 動態 Gas 寫法 (安全)
            "maxFeePerGas": w3.eth.gas_price,
            "maxPriorityFeePerGas": w3.eth.gas_price,
        })
        signed_txn = w3.eth.account.sign_transaction(txn, private_key=PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        
        logger.info(f"等待交易上鏈... TxHash: {tx_hash.hex()}")
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        logger.info(f"✅ 真實決策指紋已成功上鏈！區塊高度: {receipt.blockNumber}")

        return {
            "decision_id": decision_id,
            "content_hash_hex": content_hash.hex(),
            "tx_hash": tx_hash.hex(),
            "block_number": receipt.blockNumber,
            "etherscan_url": f"https://sepolia.etherscan.io/tx/{tx_hash.hex()}",
            "is_mock": False
        }
    except Exception as e:
        logger.error(f"❌ 真實上鏈失敗: {e}")
        raise e


def verify_decision_on_chain(decision_id: str, decision_dict: dict) -> dict:
    """重新計算 hash, 並與鏈上紀錄比對, 確認資料是否被竄改"""
    content_hash = compute_hash(decision_dict)
    
    if use_fallback:
        return {
            "decision_id": decision_id,
            "matched": True,
            "onchain_timestamp": int(time.time()),
            "submitter": "0xMockAddress",
            "is_mock": True
        }
        
    try:
        matched, timestamp, submitter = contract.functions.verifyDecision(
            decision_id, content_hash
        ).call()
        return {
            "decision_id": decision_id,
            "matched": matched,
            "onchain_timestamp": timestamp,
            "submitter": submitter,
            "is_mock": False
        }
    except Exception as e:
        logger.error(f"❌ 鏈上驗證失敗: {e}")
        return {"matched": False, "error": str(e)}

def audit_proposal_on_chain(proposal_data: dict) -> dict:
    """
    保留給原本 report_generator.py 呼叫的相容性 Wrapper。
    將舊的資料結構轉換為新的 4.1 結構，並呼叫新的 Web3 上鏈函式。
    """
    decision_id = f"atlas-2026-{str(uuid.uuid4())[:8]}"
    proposal = proposal_data.get("proposal", {})
    notes_hash = hashlib.sha256(proposal.get("market_gap", "").encode('utf-8')).hexdigest()
    
    structured_payload = {
        "decision_id": decision_id,
        "timestamp_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "agent_pipeline_version": "v1.3.0",
        "trigger_news_source": proposal_data.get("source_news", "unknown_source"),
        "product_type": proposal.get("product_name", "未知險種"),
        "underwriter_notes_hash": f"sha256:{notes_hash}",
        "final_decision_summary": f"預期損失 {proposal_data.get('actuarial_data', {}).get('expected_loss_usd', 0)} USD"
    }
    
    result = record_decision_on_chain(decision_id, structured_payload)
    
    # 轉回舊的格式讓原本系統相容
    return {
        "data_hash": result["content_hash_hex"],
        "blockchain_tx_hash": result["tx_hash"],
        "verification_url": result["etherscan_url"],
        "network": "Ethereum Sepolia Testnet (Mock)" if result.get("is_mock") else "Ethereum Sepolia Testnet",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
