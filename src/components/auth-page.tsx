import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
// https://magicui.design/docs/components/particles
import { Particles } from "@/components/ui/particles";
import { ChevronLeftIcon } from "lucide-react";
import type React from "react";

export function AuthPage() {
	return (
		<div className="relative w-full md:h-screen md:overflow-hidden">
			<Particles
				className="absolute inset-0"
				color="#666666"
				ease={20}
				quantity={120}
			/>
			<div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4">
				<Button asChild className="absolute top-4 left-4" variant="ghost">
					<a href="#">
						<ChevronLeftIcon />
						Home
					</a>
				</Button>

				<div className="mx-auto space-y-4 sm:w-sm">
					<Logo className="h-6" />
					<div className="flex flex-col space-y-1">
						<h1 className="font-bold text-2xl tracking-wide">
							Sign in to Community Knowledge Weaver
						</h1>
						<p className="text-base text-muted-foreground">
							Turn scattered organizational knowledge into actionable learning paths and guided workflows.
						</p>
					</div>
					<div className="space-y-2">
						<Button className="w-full" size="lg" type="button">
							<GoogleIcon className="mr-2 h-4 w-4" />
							Continue with Google
						</Button>
					</div>
					<p className="mt-8 text-muted-foreground text-sm">
						By clicking continue, you agree to our{" "}
						<a
							className="underline underline-offset-4 hover:text-primary"
							href="#"
						>
							Terms of Service
						</a>{" "}
						and{" "}
						<a
							className="underline underline-offset-4 hover:text-primary"
							href="#"
						>
							Privacy Policy
						</a>
						.
					</p>
				</div>
			</div>
		</div>
	);
}

const GoogleIcon = (props: React.ComponentProps<"svg">) => (
	<svg fill="currentColor" viewBox="0 0 24 24" {...props}>
		<g>
			<path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669   C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62   c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401   c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
		</g>
	</svg>
);

