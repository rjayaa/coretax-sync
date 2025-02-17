import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

export const ErrorState = ({ error, onRetry }: ErrorStateProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex flex-col items-center justify-center p-4 space-y-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div className="text-center">
          <p className="text-sm font-medium text-destructive">
            Terjadi kesalahan
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {error.message}
          </p>
        </div>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Coba Lagi
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);
