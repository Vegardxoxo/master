import {
  FileCode,
  GitBranch,
  GitPullRequest,
  RefreshCw,
  Shield,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-full mb-4">
          <GitBranch className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold mb-2">GitHub Actions in GitTrack</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Automating metrics collection from student repositories
        </p>
      </header>

      <div className="mb-16 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm">
        <p className="text-gray-800 leading-relaxed">
          GitTrack leverages GitHub Actions to automatically receive key metrics
          and updates from student repositories. This is achieved by setting up
          custom workflows in each student repository that are triggered on push
          and pull_request events to the main or master branch.
        </p>
      </div>

      <h2 className="text-2xl font-bold mt-16 mb-8 flex items-center">
        <RefreshCw className="h-6 w-6 mr-2 text-blue-600" />
        Workflows Overview
      </h2>

      <p className="mb-6 text-lg">GitTrack uses three distinct workflows:</p>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-green-50 p-2 rounded-full mr-3">
              <FileCode className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-bold">list_files.yml</h3>
          </div>
          <p className="text-gray-600">
            Lists all committed files in the repository
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-purple-50 p-2 rounded-full mr-3">
              <GitBranch className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-bold">notify_updates.yml</h3>
          </div>
          <p className="text-gray-600">
            Signals that new updates are available
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-blue-50 p-2 rounded-full mr-3">
              <GitPullRequest className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-bold">upload_coverage.yml</h3>
          </div>
          <p className="text-gray-600">
            Sends test coverage data to the application
          </p>
        </div>
      </div>

      <div className="mb-16 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-blue-50 p-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold flex items-center">
            <GitPullRequest className="h-6 w-6 mr-2 text-blue-600" />
            Upload Coverage Workflow
          </h2>
        </div>
        <div className="p-8">
          <p className="mb-6 text-gray-800 leading-relaxed">
            The <code>upload_coverage.yml</code> workflow begins by checking out
            the repository using the <code>checkout@v4</code> action. It then
            sets up a Node.js environment via <code>setup-node@v4</code>,
            followed by installing project dependencies with{" "}
            <code>npm install</code>.
          </p>
          <p className="mb-4 text-gray-800 leading-relaxed">
            After building the project, tests are run using the command{" "}
            <code>
              npm test -- --coverage --coverageReporters="json-summary"
            </code>
            , which generates a Jest coverage summary report.
          </p>
          <p className="text-gray-800 leading-relaxed">
            Finally, a custom script is executed to format this data into a JSON
            payload, which is sent to GitTrack's <code>/coverage</code>{" "}
            endpoint. The backend parses, stores, and displays the resulting
            data in the dashboard.
          </p>
        </div>
      </div>

      <div className="mb-16 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-green-50 p-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold flex items-center">
            <FileCode className="h-6 w-6 mr-2 text-green-600" />
            List Files Workflow
          </h2>
        </div>
        <div className="p-8">
          <p className="mb-6 text-gray-800 leading-relaxed">
            The <code>list_files.yml</code> workflow also uses the{" "}
            <code>checkout</code> action but skips the install and build steps.
            Instead, it runs a custom script to generate a JSON-formatted list
            of files in the repository.
          </p>
          <p className="text-gray-800 leading-relaxed">
            Since GitTrack primarily analyzes projects from a web development
            course, special handling is included to avoid listing thousands of
            subfolders under <code>node_modules</code> in the case this is not
            included in git ignore. Instead, this folder is summarized as a
            single entry. The resulting file list is then sent to GitTrack's{" "}
            <code>/files</code> API route, where it is parsed, stored, and
            visualized.
          </p>
        </div>
      </div>

      <div className="mb-16 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-purple-50 p-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold flex items-center">
            <GitBranch className="h-6 w-6 mr-2 text-purple-600" />
            Notify Updates Workflow
          </h2>
        </div>
        <div className="p-8">
          <p className="text-gray-800 leading-relaxed">
            The final action, <code>notify_updates.yml</code>, sends a
            lightweight payload to the <code>/alert-update</code> route,
            indicating that new changes have been pushed. This event triggers a
            backend function that fetches and updates relevant data for the
            repository such as recent commits and pull requests.
          </p>
        </div>
      </div>

      <div className="mb-16 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-amber-50 p-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold flex items-center">
            <Shield className="h-6 w-6 mr-2 text-amber-600" />
            Security and Configuration
          </h2>
        </div>
        <div className="p-8">
          <p className="text-gray-800 leading-relaxed">
            All workflows rely on two repository secrets defined in each student
            repository: <code>API_ENDPOINT</code> and{" "}
            <code>WEBHOOK_SECRET</code>. These values ensure that payloads are
            sent to the correct URL and can be verified securely by the GitTrack
            backend.
          </p>
          <p className="mt-6 text-gray-800 leading-relaxed">
            Secrets are encrypted and never exposed in the repository, providing
            a secure and reliable integration.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Zap className="h-6 w-6 mr-2 text-blue-600" />
          Benefits
        </h2>

        <p className="mb-6 text-gray-800">
          This architecture yields several benefits:
        </p>

        <ul className="space-y-5">
          <li className="flex items-start">
            <div className="bg-white p-1 rounded-full mr-3 mt-1">
              <Zap className="h-4 w-4 text-blue-600" />
            </div>
            <span className="leading-relaxed">
              It enables the collection of metrics that are not accessible
              through GitHub's APIs such as test coverage.
            </span>
          </li>
          <li className="flex items-start">
            <div className="bg-white p-1 rounded-full mr-3 mt-1">
              <Zap className="h-4 w-4 text-blue-600" />
            </div>
            <span className="leading-relaxed">
              It avoids regularly polling GitHub's API to fetch data by instead
              relying on a push-based model that updates GitTrack only when new
              data is available.
            </span>
          </li>
          <li className="flex items-start">
            <div className="bg-white p-1 rounded-full mr-3 mt-1">
              <Zap className="h-4 w-4 text-blue-600" />
            </div>
            <span className="leading-relaxed">
              It allows the dashboard to stay continuously and automatically
              updated without any manual input.
            </span>
          </li>
        </ul>
      </div>

      <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>GitTrack GitHub Actions Documentation</p>
      </footer>
    </div>
  );
}
