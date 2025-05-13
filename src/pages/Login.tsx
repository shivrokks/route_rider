
import { SignIn } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Login = () => {
  return (
    <div className="container flex items-center justify-center min-h-screen mx-auto">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign In to BusTracker</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <SignIn
            path="/login"
            appearance={{
              elements: {
                rootBox: "mx-auto w-full",
                card: "rounded-lg shadow-none border-none",
                formButtonPrimary: "bg-bus-primary hover:bg-bus-primary/90"
              }
            }}
            redirectUrl="/"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
