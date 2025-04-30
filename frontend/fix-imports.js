const fs = require("fs")
const path = require("path")

const directoryPath = path.join(__dirname, "src")

// Înlocuiri relative → aliasuri
const aliasReplacements = [
  ["components/homepage/", "@components/homepage/"],
  ["components/Layout/", "@components/Layout/"],
  ["components/altcoinSeason/", "@components/altcoinSeason/"],
  ["components/indicators/", "@components/indicators/"],
  ["components/news/", "@components/news/"],
  ["components/sentimentTrend/", "@components/sentimentTrend/"],
  ["components/currencyDetails/", "@components/currencyDetails/"],
  ["components/whaleTransactions/", "@components/whaleTransactions/"],
  ["hooks/homepage/", "@hooks/homepage/"],
  ["hooks/whaleTransactions/", "@hooks/whaleTransactions/"],
  ["assets/", "@assets/"],
  ["pages/", "@pages/"],
]

function getAllTSFiles(dir, allFiles = []) {
  const files = fs.readdirSync(dir)
  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      getAllTSFiles(filePath, allFiles)
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      allFiles.push(filePath)
    }
  })
  return allFiles
}

function updateImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8")
  const originalContent = content

  aliasReplacements.forEach(([oldPath, newPath]) => {
    const regex = new RegExp(`(["'\`])(?:\\.\\.?\\/)+${oldPath}`, "g")
    content = content.replace(regex, `$1${newPath}`)
  })

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, "utf8")
    console.log(`✅ Updated: ${filePath}`)
  }
}

const files = getAllTSFiles(directoryPath)
files.forEach(updateImportsInFile)
