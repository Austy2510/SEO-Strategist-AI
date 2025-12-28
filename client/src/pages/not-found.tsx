import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100">
      <Card className="w-full max-w-md mx-4 bg-slate-900 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-rose-500" />
            <h1 className="text-2xl font-bold text-slate-100">404 Page Not Found</h1>
          </div>
          
          <p className="mt-4 text-sm text-slate-400">
            This page has been de-indexed or never existed. Check your URL structure.
          </p>
          
          <div className="mt-8">
            <a href="/" className="text-indigo-400 hover:text-indigo-300 hover:underline">
              Return to Dashboard
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
