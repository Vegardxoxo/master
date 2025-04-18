import {getRepoLanguages} from "@/app/lib/data/github-api-functions"
import LanguageDistribution, {type LanguageData} from "./language-distribution"

interface LanguageDistributionWrapperProps {
    owner: string
    repo: string
    maxLanguages?: number
}

/**
 * Wrapper component for LanguageDistribution which fetches data from GitHub API.
 */
export default async function LanguageDistributionWrapper({
                                                              owner,
                                                              repo,
                                                              maxLanguages = 10,
                                                          }: LanguageDistributionWrapperProps) {
    const rawData = await getRepoLanguages(owner, repo)

    if (!rawData) {
        return <LanguageDistribution data={undefined}/>
    }

    const totalBytes = Object.values(rawData).reduce((sum, bytes) => sum + bytes, 0)

    let formattedData: LanguageData[] = Object.entries(rawData).map(([name, value]) => ({
        name,
        value,
        percentage: (value / totalBytes) * 100,
    }))

    formattedData.sort((a, b) => b.percentage - a.percentage)

    if (formattedData.length > maxLanguages) {
        const topLanguages = formattedData.slice(0, maxLanguages - 1)
        const otherLanguages = formattedData.slice(maxLanguages - 1)

        const otherValue = otherLanguages.reduce((sum, lang) => sum + lang.value, 0)
        const otherPercentage = otherLanguages.reduce((sum, lang) => sum + lang.percentage, 0)

        formattedData = [
            ...topLanguages,
            {
                name: "Other",
                value: otherValue,
                percentage: otherPercentage,
            },
        ]
    }

    return <LanguageDistribution data={formattedData}/>
}
