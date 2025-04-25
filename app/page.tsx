import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <div className="comic-panel p-8 bg-white relative overflow-hidden">
          <div className="action-lines"></div>
          <div className="relative z-10">
            <div className="speech-bubble mb-8 transform rotate-2 hover-bubble-purple">
              <h1 className="text-4xl md:text-5xl font-bold mb-0 text-black">
                Visual Simulations for Complex Concepts
              </h1>
            </div>
            <p className="text-lg mb-8 text-gray-800 font-comic">
              Explore interactive simulations that make learning technical concepts fun and engaging. From networking to
              algorithms, see how things work in a comic-style visualization.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/simulations">
                <Button className="bg-black text-white hover:bg-gray-800 text-lg px-6 py-6 h-auto font-jetbrains hover-pop">
                  Explore Simulations
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  variant="outline"
                  className="border-black text-black hover:bg-gray-100 text-lg px-6 py-6 h-auto font-jetbrains hover-pop"
                >
                  Join Our Community
                </Button>
              </Link>
            </div>
          </div>

          {/* Comic decorative elements */}
          <div className="comic-diamond" style={{ top: "20px", right: "40px" }}></div>
          <div className="comic-diamond" style={{ bottom: "60px", left: "30px" }}></div>
        </div>
        <div className="comic-panel bg-white relative overflow-hidden">
          <div className="action-lines"></div>
          <div className="relative p-4">
            <div className="comic-text-box absolute top-4 right-4 transform rotate-3 z-10 hover-box-green">
              <h2 className="text-xl font-bold m-0 font-comic">FRUSTRATED IN YOUR CUBICLE?</h2>
            </div>
            <Image
              src="/1.png"
              alt="Frustrated developer"
              width={600}
              height={600}
              className="w-full h-auto "
            />
          </div>
        </div>
      </section>

      {/* Featured Simulations */}
      <section className="mb-20">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-black font-comic hover-text-blue">Featured Simulations</h2>
          <Link href="/simulations" className="text-black underline font-jetbrains hover-pop">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Client-Server Model",
              description: "Visualize how clients and servers communicate in a network.",
              image: "/2.png",
              link: "/simulations/networking",
              panelClass: "hover-panel-purple"
            },
            {
              title: "Fibonacci Sequence",
              description: "Watch the Fibonacci sequence unfold visually.",
              image: "/3.png",
              link: "/simulations/fibonacci",
              panelClass: "hover-panel-green",
            },
            {
              title: "Git Workflow",
              description: "See how Git works with visual avatars and branches.",
              image: "/4.png",
              link: "/simulations/git",
              panelClass: "hover-panel-purple",
            },
          ].map((sim, index) => (
            <Link href={sim.link} key={index}>
              <div className="border-2 border-black overflow-hidden hover-pop transition-all">
                <div className={`comic-panel ${sim.panelClass}`}>
                  <Image
                    src={sim.image || "/placeholder.svg"}
                    alt={sim.title}
                    width={300}
                    height={200}
                    className={`w-full h-48 object-cover `}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2 text-black font-comic hover-text-blue">{sim.title}</h3>
                  <p className="text-gray-800 font-comic">{sim.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works - Comic Story Style */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center text-black font-comic">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Panel 1 - Accelerator */}
          <div className="md:col-span-6 comic-panel hover-panel-blue bg-gray-100 relative">
            <div className="comic-text-box absolute top-0 left-0 bg-black text-white z-10 hover-box-blue">
              <h3 className="text-lg font-bold m-0 text-black font-comic hover-text-white">SIMULATION ACCELERATOR</h3>
            </div>
            <div className="comic-text-box absolute bottom-4 right-4 max-w-[80%] z-10">
              <p className="m-0 font-comic text-m">
                ALL SIMULATION CREATORS WILL BE FEATURED AND CONSIDERED FOR OUR ACCELERATOR PROGRAM. ACCEPTED TEAMS WILL
                RECEIVE THE FOLLOWING:
              </p>
            </div>
            <Image
              src="/5.png"
              alt="Accelerator program"
              width={400}
              height={200}
              className="w-full h-48 object-cover"
            />
          </div>

          {/* Panel 2 - Funding */}
          <div className="md:col-span-6 comic-panel hover-panel-purple bg-gray-100 relative">
            <div className="comic-text-box absolute bottom-4 left-4 max-w-[80%] z-10">
              <h2 className="text-lg font-bold m-0 font-comic">KICKSTART</h2>
              <p className="m-0 font-comic text-sm">Learn with visual that are editable.</p>
            </div>
            <Image
              src="/6.png"
              alt="Funding"
              width={400}
              height={200}
              className="w-full h-65 object-cover"
            />
          </div>          
        </div>

        {/* Comic decorative elements */}
        <div className="relative h-20">
          <div className="comic-triangle" style={{ bottom: "0", left: "10%" }}></div>
          <div className="comic-diamond" style={{ top: "0", right: "10%", background: "#d1d5db" }}></div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center border-2 border-black p-8 comic-panel hover-panel-purple bg-gray-50">
        <h2 className="text-3xl font-bold mb-4 text-black font-comic hover-text-purple">Ready to Dive In?</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-800 font-comic">
          Join our community of learners and contributors. Create an account to upload your own simulations or explore
          our existing collection.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/simulations">
            <Button className="bg-black text-white hover:bg-gray-800 text-lg px-6 py-6 h-auto font-jetbrains hover-pop hover-blue">
              Browse Simulations
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button
              variant="outline"
              className="border-black text-black hover:bg-gray-100 text-lg px-6 py-6 h-auto font-jetbrains hover-pop hover-green"
            >
              Create Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
