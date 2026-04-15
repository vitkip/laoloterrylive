const fs = require('fs');
const files = [
  'HotNumbers.jsx', 'ColdNumbers.jsx', 'DigitDistribution.jsx', 
  'HistoricalVolatility.jsx', 'AnimalStats.jsx', 'CustomFrequency.jsx'
];
files.forEach(f => {
  const path = 'src/components/' + f;
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(/export default function (\w+)\(\) \{/g, 'export default function $1({ timeframe }) {');
    content = content.replace(/const \{ stats, loading \} = useStatistics\(\);/g, 'const { stats, loading } = useStatistics(timeframe);');
    fs.writeFileSync(path, content);
  }
});
