import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

import { useTranslation } from "react-i18next";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  return (
    <div className="bg-muted/30 selection:bg-primary/10 flex min-h-screen flex-col">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link
          to="/"
          className="text-primary flex items-center gap-2 text-2xl font-bold tracking-tighter"
        >
          <Zap className="fill-primary h-6 w-6" />
          <span>ToggleFlow</span>
        </Link>
        <ModeToggle />
      </div>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Card className="border-border/40 shadow-primary/5 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">
                {t("auth.forgotPassword.title")}
              </CardTitle>
              <CardDescription>{t("auth.forgotPassword.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">{t("auth.login.emailLabel")}</Label>
                <Input id="email" type="email" placeholder="m@example.com" />
              </div>
              <Button className="w-full">{t("auth.forgotPassword.submitButton")}</Button>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link
                to="/login"
                className="text-muted-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("auth.forgotPassword.backToLogin")}
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
