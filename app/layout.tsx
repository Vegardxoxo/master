import "@/app/ui/global.css";
import { inter } from "@/app/ui/fonts";
import { Toaster } from "@/components/ui/toaster";
import { ReportHelperProvider } from "@/app/contexts/report-context-helper";
import { ReportProvider } from "@/app/contexts/report-context";
import { UserProvider } from "@/app/contexts/user-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <UserProvider>
          <ReportHelperProvider>
            <ReportProvider>
              {children}
              <Toaster />
            </ReportProvider>
          </ReportHelperProvider>
        </UserProvider>
      </body>
    </html>
  );
}
