
import { SignUp } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Signup = () => {
  return (
    <div className="container flex items-center justify-center min-h-screen mx-auto">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create BusTracker Account</CardTitle>
          <CardDescription>Sign up to track your buses and get notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <SignUp
            path="/signup"
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

export default Signup;
