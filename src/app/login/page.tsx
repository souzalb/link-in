import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Decorative background elements using CSS variables from globals.css */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/20 mix-blend-screen rounded-full filter blur-[120px] animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-secondary/20 mix-blend-screen rounded-full filter blur-[120px] animate-blob animation-delay-2000"></div>
      
      <div className="z-10 w-full flex justify-center p-4">
        <LoginForm />
      </div>
    </div>
  );
}
