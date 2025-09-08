import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiService } from "@/api";
import { AuthHelpers, type LoginResponse } from "@/api/authService";
import { type BaseResponse } from "@/api/types";
import { useAppStore } from "@/stores";
import { z } from "zod";
import { toast } from "sonner";

// Zod schema for login form validation
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  userType: z.enum(["employee", "student"]),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const { setUser } = useAppStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    userType: "employee",
  });

  const handleBrandClick = () => {
    navigate("/");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      userType: value as "employee" | "student",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate form data with Zod
      const validatedData = loginSchema.parse(formData);

      const response = (await apiService.post("/api/v1/auth/login", {
        email: validatedData.email,
        password: validatedData.password,
        userType: validatedData.userType,
      })) as BaseResponse<LoginResponse>;

      if (response.success) {
        // Extract user data from response
        const userData = AuthHelpers.getUserFromResponse(response);

        if (userData) {
          // Save user data to Zustand store
          setUser(userData);

          // Manually set the auth token to ensure it's properly stored
          if (userData.accessToken) {
            apiService.setAuthToken(userData.accessToken);
            console.log(
              "Access token set successfully:",
              userData.accessToken.substring(0, 20) + "..."
            );

            // Debug: Check authentication status after setting token
            apiService.debugAuthStatus();
          }

          toast.success("Login successful! Welcome back.");
          navigate("/dashboard/organizations");
        } else {
          console.error("Failed to extract user data from response");
          toast.error("Login failed: Unable to process user data");
        }
      }
      // Note: API errors are automatically handled by apiService with toast notifications
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        const fieldErrors: Partial<LoginFormData> = {};
        error.issues.forEach((err) => {
          const fieldName = err.path[0];
          if (
            fieldName &&
            typeof fieldName === "string" &&
            fieldName in loginSchema.shape
          ) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (fieldErrors as any)[fieldName] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        // Handle unexpected errors (API errors are handled by apiService)
        console.error("Login error:", error);
        toast.error(
          "An unexpected error occurred during login. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Brand Logo and Name */}
      <div className="flex flex-col items-center gap-4 mb-4">
        <div
          className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleBrandClick}
        >
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground">SendTrail</span>
        </div>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="userType">User Type</Label>
                  <Select
                    required
                    value={formData.userType}
                    onValueChange={handleUserTypeChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.userType && (
                    <p className="text-sm text-red-500">{errors.userType}</p>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="johndoe@mailinator.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline cursor-pointer"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className={`pr-10 ${
                        errors.password ? "border-red-500" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Login"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground text-center text-xs text-balance">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
