import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { API } from '../utils/api'

const ENDPOINT = `${API}/puplatao-bets.php`

/**
 * ສະຖານະການແທງ demo ຂອງ ປູປາເຕົ້າ — ເອີ້ນ 1 ຄັ້ງຕໍ່ໜ້າ ແລ້ວສົ່ງຜົນລົງໃຫ້ບັດແຕ່ລະຄູ່
 * (ບໍ່ໃຫ້ 3 ບັດ ຍິງ config/wallet ຄົນລະຄັ້ງ).
 *
 * ອັດຕາຈ່າຍ ແລະ ເລກງວດຖັດໄປ ໂຫຼດໄດ້ໂດຍບໍ່ຕ້ອງ login — ຜູ້ຢ້ຽມຊົມຈຶ່ງເຫັນ
 * ວ່າຄູ່ນີ້ຈ່າຍເທົ່າໃດ ກ່ອນຕັດສິນໃຈສະໝັກ.
 */
export function usePuplataoBetting() {
  const { user, authFetch } = useAuth()
  const [config, setConfig]   = useState(null)
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [configError, setConfigError] = useState(false)
  const [pending, setPending] = useState([])

  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch(`${ENDPOINT}?r=config`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setConfig(data)
      setConfigError(false)
    } catch {
      // ໜ້າສູດຍັງອ່ານໄດ້ຢູ່ — ແຕ່ແຜງແທງຕ້ອງບອກວ່າໂຫຼດອັດຕາຈ່າຍບໍ່ໄດ້
      setConfigError(true)
    }
  }, [])

  const loadBalance = useCallback(async () => {
    if (!user) { setBalance(null); return }
    const res = await authFetch(`${ENDPOINT}?r=wallet`)
    if (res.ok) setBalance(Number(res.data.balance) || 0)
  }, [user, authFetch])

  // ບິນທີ່ຍັງລໍຜົນ — ໃຊ້ບອກວ່າງວດນີ້ແທງໄປແລ້ວ (1 ງວດ = 1 ຄູ່ ຕໍ່ສູດ)
  const loadPending = useCallback(async () => {
    if (!user) { setPending([]); return }
    const res = await authFetch(`${ENDPOINT}?r=bets&status=pending&limit=20`)
    if (res.ok) setPending(res.data.bets || [])
  }, [user, authFetch])

  useEffect(() => {
    setLoading(true)
    Promise.all([loadConfig(), loadBalance(), loadPending()]).finally(() => setLoading(false))
  }, [loadConfig, loadBalance, loadPending])

  /**
   * ວາງເດີມພັນ 1 ບິນ. ຄືນ true ເມື່ອສຳເລັດ.
   * ສົ່ງ expected_draw_no ໄປນຳ — ຖ້າຜົນງວດເຂົ້າມາລະຫວ່າງທີ່ເປີດໜ້າຄ້າງໄວ້
   * server ຈະປະຕິເສດ ແທນທີ່ຈະຮັບແທງໃສ່ງວດຜິດ.
   */
  const placeBet = useCallback(async ({ betKind, symbolA, symbolB, stake, rank, score, prob }) => {
    if (!user) return false
    const res = await authFetch(`${ENDPOINT}?r=bets`, {
      method: 'POST',
      body: JSON.stringify({
        bet_kind: betKind,
        symbol_a: symbolA,
        symbol_b: symbolB,
        stake,
        rank,
        score,
        prob,
        expected_draw_no: config?.next_draw_no,
      }),
    })

    if (!res.ok) {
      toast.error(res.data?.error || 'ວາງເດີມພັນບໍ່ສຳເລັດ')
      if (res.data?.next_draw_no) loadConfig()
      if (res.status === 409) loadPending()
      return false
    }

    setBalance(Number(res.data.new_balance) || 0)
    loadPending()
    toast.success(`ວາງເດີມພັນແລ້ວ · ງວດ ${res.data.target_draw_no}`)
    return true
  }, [user, authFetch, config, loadConfig, loadPending])

  const rateOf = useCallback(
    (kind) => config?.rates?.find(r => r.bet_kind === kind) || null,
    [config],
  )

  /** ບິນທັງໝົດທີ່ລໍຜົນຢູ່ ຂອງສູດນີ້ ໃນງວດຖັດໄປ — ໃຊ້ໝາຍຄູ່ທີ່ແທງໄປແລ້ວ */
  const pendingFor = useCallback(
    (kind) => pending.filter(
      b => b.bet_kind === kind && b.target_draw_no === config?.next_draw_no,
    ),
    [pending, config],
  )

  return {
    isAuthed: !!user,
    config,
    configError,
    reloadConfig: loadConfig,
    pendingFor,
    balance,
    loading,
    placeBet,
    rateOf,
    refresh: loadBalance,
    nextDrawNo: config?.next_draw_no ?? null,
  }
}
