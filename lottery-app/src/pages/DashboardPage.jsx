import { useState } from 'react'
import DashboardHeader from '../components/DashboardHeader'
import HotNumbers from '../components/HotNumbers'
import ColdNumbers from '../components/ColdNumbers'
import DigitDistribution from '../components/DigitDistribution'
import HistoricalVolatility from '../components/HistoricalVolatility'
import AnimalStats from '../components/AnimalStats'
import ArchiveTable from '../components/ArchiveTable'
import CustomFrequency from '../components/CustomFrequency'
import WeekdayStats from '../components/WeekdayStats'
import PairingStats from '../components/PairingStats'

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState('all')

  return (
    <>
      {/* Dashboard Header with Timeframe Picker */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
        <DashboardHeader />
        
        <div className="flex items-center gap-2 bg-white dark:bg-[#152033] px-4 py-2 rounded-xl shadow-sm border border-[#c3c5d7]/30">
          <span className="material-symbols-outlined text-[#737686] dark:text-[#94a3b8] text-xl">calendar_today</span>
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-transparent border-none outline-none font-bold text-[#121c2a] dark:text-white cursor-pointer"
          >
            <option value="1_month">1 ເດືອນຍ້ອນຫຼັງ</option>
            <option value="3_months">3 ເດືອນຍ້ອນຫຼັງ</option>
            <option value="1_year">1 ປີຍ້ອນຫຼັງ</option>
            <option value="all">ທັງໝົດ</option>
          </select>
        </div>
      </div>

      {/* Bento Grid — Hot + Cold Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
        <HotNumbers timeframe={timeframe} />
        <ColdNumbers timeframe={timeframe} />
      </div>

      {/* Statistics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 mb-16 sm:mb-20">
        <DigitDistribution timeframe={timeframe} />
        <HistoricalVolatility timeframe={timeframe} />
      </div>

      {/* Animal Stats */}
      <div className="mb-12">
        <AnimalStats timeframe={timeframe} />
      </div>

      {/* Advanced Analytics Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
        <WeekdayStats timeframe={timeframe} />
        <PairingStats timeframe={timeframe} />
      </div>

      {/* Custom Top 40 Section */}
      <div className="mb-16">
        <CustomFrequency timeframe={timeframe} />
      </div>

      {/* Archive Table */}
      <ArchiveTable />
    </>
  )
}
