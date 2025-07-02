"use client";

import { useState } from "react";
import useAuthStore from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";

export function Home() {
  const user = useAuthStore((state) => state.user);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    try {
      setLoading(true);
      setResponse("");
      const res = await axios.post('/api/gemini', { prompt });
      setResponse(res.data.text);
    } catch (error) {
      console.error("Error generating content:", error);
      setResponse("Sorry, there was an error generating a response. Please try again.");
    } finally {
      setLoading(false);
      setPrompt("");
    }
  };

  return (
    <div className="container mx-auto py-8 pt-32">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome {user?.name} 👋🏻</h1>
        <p className="text-gray-600">Ask anything</p>
      </div>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Ask something..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="w-full"
          >
            {loading ? "Generating..." : "Generate Response"}
          </Button>
        </form>
        {response && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Response:</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <Textarea
                readOnly
                value={response}
                className="min-h-[200px] w-full bg-transparent border-none resize-none focus-visible:ring-0"
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default Home;