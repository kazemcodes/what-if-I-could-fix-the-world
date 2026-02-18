import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-heading text-gold-gradient text-shadow-fantasy mb-4">
          Story AI Studio
        </h1>
        <p className="text-xl md:text-2xl font-body text-fantasy-text-light/80 max-w-2xl mx-auto">
          Create and play interactive story worlds powered by AI
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <FeatureCard
          title="Create Worlds"
          description="Build rich fantasy worlds with our intuitive creator studio"
          icon="🗺️"
        />
        <FeatureCard
          title="AI Game Master"
          description="Experience dynamic storytelling powered by advanced AI"
          icon="🧙"
        />
        <FeatureCard
          title="Play Together"
          description="Invite friends to your private server and adventure together"
          icon="⚔️"
        />
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-12">
        <Link href="/auth/register" className="btn-fantasy text-lg">
          Start Your Journey
        </Link>
        <Link href="/auth/login" className="btn-fantasy-secondary text-lg">
          Learn More
        </Link>
      </div>

      {/* Decorative Divider */}
      <div className="divider-fantasy mt-16 max-w-md">
        <span className="text-fantasy-gold text-2xl">✦</span>
      </div>
    </main>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="card-parchment text-center hover:scale-105 transition-transform duration-300">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="font-heading text-xl text-fantasy-text-primary mb-2">{title}</h3>
      <p className="font-body text-fantasy-text-secondary">{description}</p>
    </div>
  );
}
