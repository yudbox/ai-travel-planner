import type { TaskConfig } from "../../../tasks-config";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  loading: boolean;
  makeAPICall: () => Promise<void>;
  config: TaskConfig;
}

export function SubmitButton({
  loading,
  makeAPICall,
  config,
}: SubmitButtonProps) {
  const getButtonText = () => {
    if (loading) return "Sending...";
    if (config.isChatMode) return "💬 Send Message";
    return "🚀 Make API Call";
  };

  return (
    <Button
      onClick={makeAPICall}
      disabled={loading}
      className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700"
    >
      {getButtonText()}
    </Button>
  );
}
