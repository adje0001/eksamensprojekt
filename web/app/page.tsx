// Start page. Placeholder until the first web feature (signup/login) is built.
// All data comes from the NestJS API (see CLAUDE.md, Architecture). No DB access here.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8">
      <h1 className="text-3xl font-semibold">Chat app</h1>
      <p className="text-zinc-500">Web client. Nothing to see yet.</p>
    </main>
  );
}
