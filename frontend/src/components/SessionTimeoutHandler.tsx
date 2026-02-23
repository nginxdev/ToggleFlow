import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export function SessionTimeoutHandler() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleSessionTimeout = () => {
      setIsOpen(true);
    };

    window.addEventListener("session-timeout", handleSessionTimeout);

    return () => {
      window.removeEventListener("session-timeout", handleSessionTimeout);
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t("auth.sessionTimeout")}</DialogTitle>
          <DialogDescription>{t("auth.sessionExpired")}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
