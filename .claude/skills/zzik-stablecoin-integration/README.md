---
name: zzik-stablecoin-integration
description: 스테이블코인 (USDT/USDC) 결제 통합 패턴 - MetaMask 연동, 트랜잭션 검증, FDS
triggers:
  - zzik-stablecoin
  - zzik-usdt-usdc
  - zzik-web3-payment
  - zzik-metamask-integration
  - zzik-스테이블코인결제
---

# ZZIK Stablecoin Integration Pattern

## 개요
USDT/USDC 스테이블코인 결제를 안전하고 효율적으로 통합하는 패턴

## 핵심 컴포넌트

### 1. 지갑 연동
- Phase 1: MetaMask (빠른 출시)
- Phase 2: 자체 지갑 (2027년)

### 2. 스테이블코인 선택
- **USDT** (Tether): 가장 많이 사용 ($150B)
- **USDC** (Circle): 규제 준수 ($60B)
- 둘 다 지원 권장

### 3. 네트워크 선택
- **Polygon**: 수수료 낮음 ($0.01), 빠름 (2초)
- **Ethereum**: 수수료 높음 ($5-20), 느림 (15초)
- 초기: Polygon 권장

## 구현 패턴

### Step 1: ethers.js 설치
```bash
pnpm add ethers wagmi viem
```

### Step 2: 지갑 연결
```typescript
// /apps/zzik-global/src/core/web3/wallet.ts
import { ethers } from 'ethers'

export class Web3Wallet {
  private provider: ethers.BrowserProvider | null = null

  async connect() {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed')
    }

    this.provider = new ethers.BrowserProvider(window.ethereum)

    // 사용자에게 연결 요청
    const accounts = await this.provider.send('eth_requestAccounts', [])

    return {
      address: accounts[0],
      provider: this.provider
    }
  }

  async switchToPolygon() {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x89' }] // Polygon Mainnet
    })
  }
}
```

### Step 3: 잔액 조회
```typescript
// USDT 컨트랙트 주소 (Polygon)
const USDT_POLYGON = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'

// ERC-20 표준 ABI
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
]

export async function getUSDTBalance(userAddress: string) {
  const provider = new ethers.JsonRpcProvider(
    process.env.POLYGON_RPC_URL
  )

  const contract = new ethers.Contract(
    USDT_POLYGON,
    ERC20_ABI,
    provider
  )

  const balance = await contract.balanceOf(userAddress)
  const decimals = await contract.decimals()

  return ethers.formatUnits(balance, decimals)
}
```

### Step 4: 결제 전송
```typescript
export async function sendPayment(
  amount: string,
  merchantAddress: string
) {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()

  const contract = new ethers.Contract(
    USDT_POLYGON,
    [
      'function transfer(address to, uint256 amount) returns (bool)'
    ],
    signer
  )

  // USDT는 6 decimals
  const amountInWei = ethers.parseUnits(amount, 6)

  // 트랜잭션 전송
  const tx = await contract.transfer(merchantAddress, amountInWei)

  // 완료 대기
  const receipt = await tx.wait()

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    status: receipt.status === 1 ? 'SUCCESS' : 'FAILED'
  }
}
```

### Step 5: 백엔드 검증
```typescript
// /apps/zzik-global/src/app/api/payment/verify/route.ts
export async function POST(req: Request) {
  const { txHash, expectedAmount, merchantAddress } = await req.json()

  // RPC로 트랜잭션 조회
  const provider = new ethers.JsonRpcProvider(
    process.env.POLYGON_RPC_URL
  )

  const tx = await provider.getTransaction(txHash)
  if (!tx) {
    return Response.json({ error: 'Transaction not found' }, { status: 404 })
  }

  // 수신자 확인
  if (tx.to?.toLowerCase() !== USDT_POLYGON.toLowerCase()) {
    return Response.json({ error: 'Invalid contract' }, { status: 400 })
  }

  // Amount 디코딩 (transfer 함수 파라미터)
  const iface = new ethers.Interface([
    'function transfer(address to, uint256 amount)'
  ])
  const decoded = iface.decodeFunctionData('transfer', tx.data)

  const actualAmount = ethers.formatUnits(decoded.amount, 6)
  const actualRecipient = decoded.to.toLowerCase()

  // 검증
  if (actualRecipient !== merchantAddress.toLowerCase()) {
    return Response.json({ error: 'Wrong recipient' }, { status: 400 })
  }

  if (Math.abs(parseFloat(actualAmount) - parseFloat(expectedAmount)) > 0.01) {
    return Response.json({ error: 'Wrong amount' }, { status: 400 })
  }

  // ✅ 검증 완료, DB 저장
  const payment = await prisma.payment.create({
    data: {
      txHash,
      amount: parseFloat(actualAmount),
      currency: 'USDT',
      status: 'COMPLETED'
    }
  })

  return Response.json({ payment })
}
```

## FDS (Fraud Detection System)

### Chainalysis API 연동
```typescript
// /apps/zzik-global/src/core/fds/chainalysis.ts
export async function checkTransaction(txHash: string) {
  const response = await fetch(
    'https://api.chainalysis.com/v1/screening',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CHAINALYSIS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transaction: txHash,
        network: 'polygon'
      })
    }
  )

  const result = await response.json()

  return {
    riskScore: result.risk_score, // 0.0 ~ 1.0
    category: result.category,    // 'low', 'medium', 'high'
    reason: result.reason
  }
}

// 사용
export async function verifyPayment(txHash: string) {
  const fraudCheck = await checkTransaction(txHash)

  if (fraudCheck.riskScore > 0.7) {
    // 고위험 거래
    await prisma.fraudAlert.create({
      data: {
        txHash,
        riskScore: fraudCheck.riskScore,
        reason: fraudCheck.reason
      }
    })

    // 관리자 알림
    await sendSlackAlert(`🚨 High risk transaction: ${txHash}`)

    // 거래 거부
    throw new Error('Transaction flagged as high risk')
  }

  return true
}
```

## 수수료 최적화

### 1. 가스비 추정
```typescript
export async function estimateGas(
  amount: string,
  recipientAddress: string
) {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()

  const contract = new ethers.Contract(
    USDT_POLYGON,
    ['function transfer(address, uint256)'],
    signer
  )

  const gasEstimate = await contract.transfer.estimateGas(
    recipientAddress,
    ethers.parseUnits(amount, 6)
  )

  // Polygon 가스 가격 (현재 시세)
  const feeData = await provider.getFeeData()
  const gasCost = gasEstimate * (feeData.gasPrice || 0n)

  return {
    gasLimit: gasEstimate,
    gasPrice: feeData.gasPrice,
    totalCost: ethers.formatEther(gasCost) // MATIC 단위
  }
}
```

### 2. 배치 처리 (수수료 절감)
```typescript
// 여러 결제를 묶어서 처리
export async function batchTransfer(
  recipients: Array<{ address: string; amount: string }>
) {
  // Multicall 컨트랙트 사용
  const multicall = new ethers.Contract(
    MULTICALL_ADDRESS,
    MULTICALL_ABI,
    signer
  )

  const calls = recipients.map(r => ({
    target: USDT_POLYGON,
    callData: contract.interface.encodeFunctionData('transfer', [
      r.address,
      ethers.parseUnits(r.amount, 6)
    ])
  }))

  // 한 번의 트랜잭션으로 여러 전송
  const tx = await multicall.aggregate(calls)
  return tx.wait()
}
```

## 에러 처리

### 일반적인 에러들
```typescript
export async function handlePaymentError(error: any) {
  if (error.code === 'ACTION_REJECTED') {
    // 사용자가 거부
    return { type: 'USER_REJECTED', message: '결제를 취소했습니다' }
  }

  if (error.code === 'INSUFFICIENT_FUNDS') {
    // 잔액 부족
    return { type: 'INSUFFICIENT_BALANCE', message: 'USDT 잔액이 부족합니다' }
  }

  if (error.code === 'NETWORK_ERROR') {
    // 네트워크 오류
    return { type: 'NETWORK_ERROR', message: '네트워크 오류. 다시 시도해주세요' }
  }

  // 기타
  return { type: 'UNKNOWN', message: error.message }
}
```

## 보안 체크리스트

### ✅ 필수 검증
- [ ] 트랜잭션 해시 검증
- [ ] 수신자 주소 검증
- [ ] 금액 검증 (±0.01 허용)
- [ ] Chainalysis FDS 체크
- [ ] 중복 트랜잭션 방지
- [ ] Rate limiting (1초 1회)

### ⚠️ 주의사항
- Private key는 **절대** 프론트엔드에 노출 금지
- 사용자 지갑은 MetaMask가 관리
- 백엔드는 읽기 전용 (검증만)
- 테스트넷 먼저 (Mumbai)

## 테스트

### Mumbai Testnet (Polygon)
```typescript
// Mumbai USDT (테스트용)
const USDT_MUMBAI = '0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832'

// Mumbai RPC
const provider = new ethers.JsonRpcProvider(
  'https://rpc-mumbai.maticvigil.com'
)

// Faucet으로 테스트 USDT 받기
// https://faucet.polygon.technology/
```

## 참고 자료
- ethers.js: https://docs.ethers.org/
- Polygon: https://docs.polygon.technology/
- Chainalysis: https://www.chainalysis.com/
- /home/ubuntu/ZZIK_AIFC_개발문서_v5_FINAL.md (Phase 3)
