"use client";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full h-full">
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
        <Navbar />

        <main className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <h2 className="text-5xl font-bold mb-6">
            Organize your work, your way
          </h2>
          <p className="text-lg max-w-2xl mb-10">
            A simple and powerful project management tool built with modern
            tech. Drag, drop, collaborate, and stay productive.
          </p>
          <Button size="lg">
            <Link href={"/sign-up"}>Start Managing</Link>
          </Button>
        </main>

        <section className="py-20 px-8 bg-white">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-6 rounded-2xl shadow bg-gray-100">
              <h3 className="text-2xl font-semibold mb-4">Drag & Drop</h3>
              <p>Easily move tasks between columns with a smooth experience.</p>
            </div>
            <div className="p-6 rounded-2xl shadow bg-gray-100">
              <h3 className="text-2xl font-semibold mb-4">
                Team Collaboration
              </h3>
              <p>Add teammates, assign tasks, and stay aligned effortlessly.</p>
            </div>
            <div className="p-6 rounded-2xl shadow bg-gray-100">
              <h3 className="text-2xl font-semibold mb-4">Real-time Sync</h3>
              <p>Powered by modern backend tech to keep everything in sync.</p>
            </div>
          </div>
        </section>

        <footer className="text-center py-8 text-sm text-gray-500">
          © 2025 Trello Clone
        </footer>
      </div>
    </div>
  );
}
