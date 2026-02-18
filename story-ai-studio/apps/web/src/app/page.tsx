"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-fantasy-bg-primary">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/textures/parchment-pattern.png')] bg-repeat" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Logo/Title */}
          <div className="mb-8">
            <h1 className="font-heading text-6xl md:text-8xl text-fantasy-gold text-shadow-fantasy mb-4">
              Story AI Studio
            </h1>
            <div className="divider-fantasy">
              <span className="text-fantasy-text-gold text-2xl">✦</span>
            </div>
            <p className="font-body text-xl md:text-2xl text-fantasy-text-light mt-6 italic">
              Create and play interactive story worlds powered by AI
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link href="/auth/register" className="btn-fantasy text-lg">
              Begin Your Journey
            </Link>
            <Link href="/auth/login" className="btn-fantasy-secondary text-lg">
              Continue Adventure
            </Link>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="card-wood text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="font-heading text-xl text-fantasy-gold mb-2">
                Create Stories
              </h3>
              <p className="text-fantasy-text-light text-sm">
                Build rich worlds with characters, locations, and quests
              </p>
            </div>
            
            <div className="card-wood text-center">
              <div className="text-4xl mb-4">🎭</div>
              <h3 className="font-heading text-xl text-fantasy-gold mb-2">
                AI Game Master
              </h3>
              <p className="text-fantasy-text-light text-sm">
                Let AI narrate your adventures and respond to your actions
              </p>
            </div>
            
            <div className="card-wood text-center">
              <div className="text-4xl mb-4">⚔️</div>
              <h3 className="font-heading text-xl text-fantasy-gold mb-2">
                Play Together
              </h3>
              <p className="text-fantasy-text-light text-sm">
                Invite friends to join your story sessions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-fantasy-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-4xl text-center text-fantasy-gold mb-12">
            Forge Your Legend
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card-parchment">
              <h3 className="font-heading text-2xl text-fantasy-text-primary mb-4">
                🗡️ For Game Masters
              </h3>
              <ul className="space-y-3 text-fantasy-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-fantasy-gold">✦</span>
                  Create detailed worlds with our intuitive builder
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-fantasy-gold">✦</span>
                  Design NPCs with rich backstories and personalities
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-fantasy-gold">✦</span>
                  Build intricate locations with atmospheric details
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-fantasy-gold">✦</span>
                  Let AI handle narration while you focus on story
                </li>
              </ul>
            </div>
            
            <div className="card-parchment">
              <h3 className="font-heading text-2xl text-fantasy-text-primary mb-4">
                🧙 For Players
              </h3>
              <ul className="space-y-3 text-fantasy-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-fantasy-gold">✦</span>
                  Create unique characters with deep customization
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-fantasy-gold">✦</span>
                  Explore AI-narrated story worlds
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-fantasy-gold">✦</span>
                  Make meaningful choices that shape the story
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-fantasy-gold">✦</span>
                  Play solo or with friends in shared adventures
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl text-fantasy-gold mb-6">
            Ready to Begin?
          </h2>
          <p className="text-fantasy-text-light text-lg mb-8">
            Join thousands of adventurers creating and playing interactive stories.
          </p>
          <Link href="/auth/register" className="btn-fantasy text-xl">
            Start Your Adventure — Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-fantasy-border-dark">
        <div className="max-w-6xl mx-auto text-center text-fantasy-text-secondary text-sm">
          <p>© 2024 Story AI Studio. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
