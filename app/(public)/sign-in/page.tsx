"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trello, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { ToastError, ToastSuccess } from "@/lib/toast";

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  // Validate input
  const validate = () => {
    const newErrors = { email: "", password: "" };

    if (!values.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!values.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      ToastError("Please check your inputs.");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        ToastError(data.error || "Login failed");
        return;
      }

      // Save token
      Cookies.set("token", data.token, {
        expires: 7,
        secure: true,
        sameSite: "strict",
      });

      ToastSuccess("Login successful!");

      // Decode token → redirect
      const payload = JSON.parse(atob(data.token.split(".")[1]));
      const userId = payload.id || payload.userId;

      router.push(`/${userId}`);
    } catch (err) {
      console.error(err);
      ToastError("Server error. Try again later.");
    }
  };

  // Auto redirect if already logged in
  useEffect(() => {
    const token = Cookies.get("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.id || payload.userId;
        router.replace(`/${userId}`);
      } catch {
        console.error("Invalid token");
      }
    }
  });

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="flex flex-col justify-center items-center">
        <Trello className="text-blue-500" size={32} />
        <CardTitle className="text-center text-xl mt-2">
          Log in to continue
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={values.password}
                onChange={(e) =>
                  setValues({ ...values, password: e.target.value })
                }
                className={errors.password ? "border-red-500 pr-10" : "pr-10"}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 mt-6">
          <Button type="submit" className="w-full">
            Log in
          </Button>

          <Link
            href="/sign-up"
            className="text-sm hover:underline text-blue-600"
          >
            Don’t have an account? Sign up
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
