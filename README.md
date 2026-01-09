# Libretto

**Libretto** is a smart contract that acts as an **on-chain deposit fund**, enforcing commitment by its owner for a specified duration.  

It is inspired by the Italian tradition of opening a *“libretto”* (a savings account) for a newborn, depositing money that the child would receive upon reaching adulthood.  

**Libretto** works in the same way, but enforces the rules **on-chain**:

---

## How it works

- The **unlock date** is defined upon contract creation and is **immutable** — neither the owner nor anyone else can change it.  
- **Anyone** can deposit funds at any time.  
- **Only the owner** can withdraw.  
- Withdrawals are **permitted only after the unlock date**, and the **entire balance** is paid out in full.  

**Example:**  

If you deposit 1 ETH today and set an unlock date of 20 years, the ETH can only be withdrawn in 2046. This enforces **long-term commitment** to an investment while keeping it fully on-chain.

---

## Key Features

| Feature | Description |
|---------|-------------|
| Immutable unlock date | Set at deployment, cannot be changed |
| Owner-only withdrawals | Only the deployer can withdraw |
| Full-balance payout | Withdrawals release the entire balance |
| Public deposits | Anyone can deposit at any time |
| On-chain enforcement | Rules are fully enforced by the Ethereum blockchain |

---

## Future ideas

- Transferable/giftable version of the contract
- Multi-owner/Multi-Sig version of the contract
- Open to suggestions :) 

---

## Deployed on

- **Mainnet:** *TBD*  
- **Testnet:** *TBD*

---

## How to use

1. **Deploy your own Libretto contract** and choose the unlock duration (in years).  
2. **Fund it** — one time or with multiple contributions (anyone can depositct at any time).  
3. **Wait** until the unlock date passes.  
4. **Withdraw the full balance** as the owner — only possible after the unlock date.  

> The contract enforces commitment automatically. If you lose the owner’s key, the funds cannot be recovered.  

---

## Disclaimer

Use at your own risk. This contract locks funds until the specified unlock date. Always double-check addresses and unlock durations before depositing.  
