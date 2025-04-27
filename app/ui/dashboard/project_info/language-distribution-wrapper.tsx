import LanguageDistribution, {type LanguageData} from "./language-distribution"
import {getLanguageDistribution} from "@/app/lib/database-functions/repository-data";


/**
 * Wrapper component for LanguageDistribution which fetches data from GitHub API.
 */
export default async function LanguageDistributionWrapper({
                                                              owner,
                                                              repo,
                                                          }: {owner: string, repo: string}) {
    const {success, languages, error} = await getLanguageDistribution(owner, repo)
    if (!success && error) {
        return <LanguageDistribution data={[]}/>
    }

    return <LanguageDistribution data={languages}/>
}
