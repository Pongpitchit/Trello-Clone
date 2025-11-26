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
import { ToastError, ToastSuccess } from "@/lib/toast";
import { Eye, EyeOff, Trello } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function SignUpPage() {
  const router = useRouter();
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = { name: "", email: "", password: "" };

    if (!values.name) {
      newErrors.name = "Name is required";
      ToastError("Name is required");
    }

    if (!values.email) {
      newErrors.email = "Email is required";
      ToastError("Email is required");
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = "Invalid email format";
      ToastError("Invalid email format");
    }

    if (!values.password) {
      newErrors.password = "Password is required";
      ToastError("Password is required");
    } else if (values.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      ToastError("Password must be at least 8 characters");
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (res.ok) {
        ToastSuccess("Account created successfully!");
        router.push("/sign-in");
      } else {
        // Check if the backend says email already exists
        if (data.error === "Email already exists") {
          ToastError("This email is already registered");
          setErrors((prev) => ({ ...prev, email: "Email already exists" }));
        } else {
          ToastError(data.error || "Failed to register");
        }
      }
    } catch (err) {
      console.error(err);
      ToastError("Server error. Try again later.");
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="flex flex-col justify-center items-center">
        <Trello className="text-blue-500" size={32} />
        <CardTitle className="text-center text-xl">
          Create your account
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form>
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
              className={errors.name ? "border-red-500" : ""}
              required
            />
          </div>

          {/* Email */}
          <div className="grid gap-2 mt-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              className={errors.email ? "border-red-500" : ""}
              required
            />
          </div>

          {/* Password */}
          <div className="grid gap-2 mt-4">
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
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-4">
        <Button type="submit" className="w-full" onClick={handleSubmit}>
          Sign up
        </Button>

        <Link
          href={"/sign-in"}
          className="hover:underline transition-all duration-150"
        >
          Already have an account? Log in
        </Link>
      </CardFooter>
    </Card>
  );
}

export default SignUpPage;
