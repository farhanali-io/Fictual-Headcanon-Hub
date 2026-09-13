import { useEffect, useRef, useState } from 'react';
import { Link, Route, Switch, useLocation } from 'wouter';
import {
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Copy,
  Download,
  Feather,
  Heart,
  Info,
  Library,
  Lightbulb,
  LockKeyhole,
  Menu,
  RotateCw,
  Save,
  ScrollText,
  Sparkles,
  Star,
  WandSparkles,
  X,
} from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

type Category = 'Personality' | 'Backstory' | 'Quirks' | 'Relationships' | 'Secrets';
type Result = { id: string; category: Category; text: string; locked: boolean; saved: boolean };
type SavedItem = { id: string; category: Category; text: string; name: string; createdAt: string };

const categories: Category[] = ['Personality', 'Backstory', 'Quirks', 'Relationships', 'Secrets'];
const palette: Record<Category, string> = {
  Personality: 'bg-[#e8d8bd] text-[#5b3d25]',
  Backstory: 'bg-[#d1e4df] text-[#22564d]',
  Quirks: 'bg-[#f2c5b5] text-[#743a32]',
  Relationships: 'bg-[#e5d5e8] text-[#593d60]',
  Secrets: 'bg-[#d5d9ed] text-[#35426d]',
};
const categoryIcons: Record<Category, typeof Feather> = {
  Personality: Feather,
  Backstory: ScrollText,
  Quirks: Sparkles,
  Relationships: Heart,
  Secrets: LockKeyhole,
};

const templates: Record<Category, string[]> = {
  Personality: [
    'They rehearse difficult conversations in the margins of whatever they are reading.',
    'They are unusually good at noticing who has been left out of a room.',
    'They would rather be thought strange than be caught pretending to understand.',
    'Their confidence arrives in short, bright bursts, usually when someone else needs help.',
    'They collect opinions slowly, but once formed, they are difficult to move.',
    'They apologize to objects after bumping into them.',
    'They treat promises like physical things: carefully held, never casually made.',
    'They can tell when someone is lying, but are terrible at admitting when they are.',
    'They have a private rule against being the first person to leave a celebration.',
    'They are at their funniest when they are most tired.',
    'They make excellent plans and then follow the feeling that interrupts them.',
    'They secretly enjoy being underestimated because it gives them room to surprise people.',
  ],
  Backstory: [
    'As a child, they were trusted with a key that opened a door no longer on any map.',
    'They learned an important skill from someone they promised never to become like.',
    'Their first big mistake was quietly repaired by a stranger who never asked for credit.',
    'They once left home for one small reason and returned with an entirely different life.',
    'A childhood friend remembers them by a nickname they have never told anyone else.',
    'They keep a receipt from the day everything in their life changed direction.',
    'They know the exact sound of a place they can no longer safely return to.',
    'Someone once mistook them for an expert, and they have been trying to deserve it ever since.',
    'Their best memory has one person missing from it, though they cannot remember who.',
    'They used to believe a harmless superstition until it came true once.',
    'They can still describe the weather on the day they learned to leave.',
    'They inherited one ordinary object with an extraordinary history.',
  ],
  Quirks: [
    'They arrange coins, buttons, or beads into tiny constellations while thinking.',
    'They use different handwriting for lists they intend to keep and lists they intend to burn.',
    'They always save the last bite of a good meal for a very specific moment.',
    'They know exactly how their favorite mug sounds when set down on different tables.',
    'They name storms, houseplants, and difficult errands alike.',
    'They keep one pocket reserved for useful things and the other for sentimental things.',
    'They pause before opening gifts, as though giving the moment time to become real.',
    'They can only fall asleep after solving a problem that does not belong to them.',
    'They instinctively count steps in unfamiliar buildings.',
    'They hum the same three notes whenever they are trying not to cry.',
    'They refuse to throw away a broken thing until they have thanked it.',
    'They have a favorite pen that is objectively uncomfortable to write with.',
  ],
  Relationships: [
    'They have one person they will always answer, even at the worst possible hour.',
    'They compete with a sibling over something neither of them actually wants.',
    'They trust the quietest person in a group first.',
    'They remember friends by the meals they shared, not the places they went.',
    'They are still carrying advice from an enemy who was right about them.',
    'They cannot say “I missed you” without adding a joke afterward.',
    'Someone they love knows the difference between their real silence and their angry silence.',
    'They keep a running list of things a particular friend would find beautiful.',
    'They once broke a rule for someone and have not decided whether it was worth it.',
    'They become fiercely polite around the person they most want to impress.',
    'They send voice notes to people they cannot bring themselves to call.',
    'They have a complicated fondness for the person who knows them least accurately.',
  ],
  Secrets: [
    'They have already chosen the name they would use if they had to disappear.',
    'They know a piece of information that would make their happiest memory look different.',
    'They keep a list of every kindness they could not repay at the time.',
    'They once made a choice for selfish reasons and let everyone believe it was noble.',
    'They have seen proof that one of their strongest beliefs is incomplete.',
    'They are quietly preparing for a goodbye they insist is not coming.',
    'They know exactly who would come looking for them, and who would not.',
    'They have preserved one message they will never send.',
    'They can name the moment they started becoming someone they did not recognize.',
    'They have a talent they hide because it belongs to an old version of themselves.',
    'They forgive people faster than they forgive themselves.',
    'They know a safe place that they have never told anyone about.',
  ],
};

const faqItems = [
  { q: 'What is a headcanon?', a: 'A headcanon is a personal idea about a character, world, or relationship that is not stated directly in the original story. It can fill in a tiny missing detail or reshape the way you play and write someone.' },
  { q: 'Is this a headcannon generator?', a: 'You may have seen “headcannon generator” in a search bar, but the usual spelling is headcanon: canon as in story canon, not cannon as in the object that launches things. Either way, you are in the right place.' },
  { q: 'Can I use these ideas in my fic or roleplay?', a: 'Absolutely. Treat each result as a spark, not a rule. Keep it, change it, combine it with a detail from your world, or use it to discover what your character does not want anyone to know.' },
  { q: 'Are my saved headcanons private?', a: 'Yes. Saved ideas live in your browser’s local storage. There is no account, upload, or server-side collection of your character notes.' },
];

function usePageMeta(title: string, description: string, schema?: typeof faqItems) {
  useEffect(() => {
    document.title = `${title} · Fictual`;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = description;
    const previous = document.getElementById('fictual-faq-schema');
    previous?.remove();
    if (schema) {
      const script = document.createElement('script');
      script.id = 'fictual-faq-schema';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: schema.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
      document.head.appendChild(script);
    }
    return () => document.getElementById('fictual-faq-schema')?.remove();
  }, [title, description, schema]);
}

function Logo() {
  return <Link href="/" className="flex items-center gap-2.5" data-testid="link-logo">
    <span className="relative grid h-9 w-9 rotate-[-7deg] place-items-center rounded-[11px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] paper-shadow">
      <Feather size={19} strokeWidth={1.7} />
      <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[hsl(var(--secondary))]" />
    </span>
    <span className="font-display text-[1.55rem] font-bold tracking-[-.04em]">Fictual</span>
  </Link>;
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  return <header className="sticky top-0 z-40 border-b border-[hsl(var(--border)/.7)] bg-[hsl(var(--background)/.9)] backdrop-blur-md">
    <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-5 lg:px-8">
      <Logo />
      <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
        <div className="relative">
          <button className="flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]" onClick={() => setToolsOpen(!toolsOpen)} aria-expanded={toolsOpen} data-testid="button-tools-menu">
            Tools <ChevronDown size={15} className={toolsOpen ? 'rotate-180 transition' : 'transition'} />
          </button>
          {toolsOpen && <div className="absolute left-1/2 top-9 w-64 -translate-x-1/2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 paper-shadow-lg">
            <Link href="/tools/headcanon-generator" className="flex items-start gap-3 rounded-xl p-3 text-left transition hover:bg-[hsl(var(--muted))]" onClick={() => setToolsOpen(false)} data-testid="link-tools-headcanon">
              <WandSparkles size={18} className="mt-0.5 text-[hsl(var(--primary))]" /><span><b className="block text-sm">Headcanon generator</b><small className="text-xs text-[hsl(var(--muted-foreground))]">Five sparks for any character</small></span>
            </Link>
            <Link href="/tools/genshin-impact-headcanon-generator" className="flex items-start gap-3 rounded-xl p-3 text-left transition hover:bg-[hsl(var(--muted))]" onClick={() => setToolsOpen(false)} data-testid="link-tools-genshin">
              <Star size={18} className="mt-0.5 text-[hsl(var(--secondary))]" /><span><b className="block text-sm">Genshin Impact</b><small className="text-xs text-[hsl(var(--muted-foreground))]">A fandom-flavored doorway</small></span>
            </Link>
          </div>}
        </div>
        <a href="#how-it-works" className="text-sm font-semibold text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]" data-testid="link-how-it-works">How it works</a>
        <a href="#faq" className="text-sm font-semibold text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]" data-testid="link-faq">FAQ</a>
      </nav>
      <div className="hidden items-center gap-3 md:flex">
        <Link href="/tools/headcanon-generator" className="rounded-full bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(47,112,96,.2)]" data-testid="link-start-creating">Start creating <ArrowRight size={15} className="ml-1 inline" /></Link>
      </div>
      <button className="rounded-lg p-2 md:hidden" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen(!menuOpen)} data-testid="button-mobile-menu">{menuOpen ? <X /> : <Menu />}</button>
    </div>
    {menuOpen && <nav className="border-t border-[hsl(var(--border))] px-5 pb-5 pt-3 md:hidden" aria-label="Mobile navigation">
      <div className="grid gap-1">
        <Link href="/tools/headcanon-generator" className="rounded-lg px-3 py-3 font-semibold hover:bg-[hsl(var(--muted))]" onClick={() => setMenuOpen(false)} data-testid="link-mobile-headcanon">Headcanon generator</Link>
        <Link href="/tools/genshin-impact-headcanon-generator" className="rounded-lg px-3 py-3 font-semibold hover:bg-[hsl(var(--muted))]" onClick={() => setMenuOpen(false)} data-testid="link-mobile-genshin">Genshin Impact generator</Link>
        <a href="#how-it-works" className="rounded-lg px-3 py-3 font-semibold hover:bg-[hsl(var(--muted))]" onClick={() => setMenuOpen(false)} data-testid="link-mobile-how">How it works</a>
        <a href="#faq" className="rounded-lg px-3 py-3 font-semibold hover:bg-[hsl(var(--muted))]" onClick={() => setMenuOpen(false)} data-testid="link-mobile-faq">FAQ</a>
      </div>
    </nav>}
  </header>;
}

function AdSlot({ label = 'A quiet space for future tools' }: { label?: string }) {
  return <aside className="my-8 flex min-h-[72px] items-center justify-center rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted)/.35)]" aria-label="Reserved advertising area" data-testid="ad-slot">
    <span className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[hsl(var(--muted-foreground)/.75)]">{label}</span>
  </aside>;
}

function SectionEyebrow({ children }: { children: string }) {
  return <div className="mb-4 flex items-center gap-2 font-mono-ui text-[10px] font-medium uppercase tracking-[.18em] text-[hsl(var(--primary))]"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--secondary))]" />{children}</div>;
}

function Home() {
  usePageMeta('Creative tools for character people', 'Fictual is a welcoming studio of free creative tools for fanfiction writers, original-character creators, and roleplayers.', faqItems);
  return <div className="grain min-h-dvh">
    <Header />
    <main>
      <section className="relative overflow-hidden px-5 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-[hsl(var(--accent)/.28)] blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[hsl(var(--secondary)/.13)] blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.04fr_.96fr]">
          <div className="relative z-10">
            <div className="reveal inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/.7)] px-3 py-1.5 font-mono-ui text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]"><Sparkles size={13} className="text-[hsl(var(--secondary))]" /> A studio for tiny details</div>
            <h1 className="reveal reveal-delay-1 text-balance mt-6 max-w-2xl font-display text-[clamp(3.25rem,7vw,6.7rem)] font-bold leading-[.92] tracking-[-.065em]">Make room for <em className="font-normal text-[hsl(var(--primary))]">the little things.</em></h1>
            <p className="reveal reveal-delay-2 mt-7 max-w-lg text-lg leading-8 text-[hsl(var(--muted-foreground))]">Fictual is a growing shelf of free creative tools for the characters who follow you home from a story.</p>
            <div className="reveal reveal-delay-3 mt-9 flex flex-wrap items-center gap-3">
              <Link href="/tools/headcanon-generator" className="group rounded-full bg-[hsl(var(--primary))] px-6 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-1 hover:shadow-[0_12px_26px_rgba(47,112,96,.2)]" data-testid="link-hero-generator">Open the headcanon generator <ArrowRight size={16} className="ml-2 inline transition group-hover:translate-x-1" /></Link>
              <a href="#tools" className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/.55)] px-5 py-3.5 text-sm font-bold transition hover:bg-[hsl(var(--muted))]" data-testid="link-browse-tools">Browse the shelf</a>
            </div>
            <div className="mt-10 flex items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]"><span className="flex -space-x-2">{['M', 'R', 'A'].map((letter, i) => <span key={letter} className={`grid h-8 w-8 place-items-center rounded-full border-2 border-[hsl(var(--background))] text-xs font-bold ${['bg-[#e5d5e8]', 'bg-[#d1e4df]', 'bg-[#f2c5b5]'][i]}`}>{letter}</span>)}</span><span>For writers, roleplayers & detail collectors</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-[500px] lg:justify-self-end">
            <div className="float-mark relative rotate-[4deg] rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 paper-shadow-lg">
              <div className="rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.38)] p-6">
                <div className="flex items-center justify-between"><span className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">character note / 014</span><Bookmark size={17} className="text-[hsl(var(--secondary))]" /></div>
                <h2 className="mt-12 font-display text-4xl font-bold tracking-[-.045em]">The almost-brave one</h2>
                <div className="mt-7 space-y-4">{['They save the last bite for a very specific moment.', 'They are excellent at noticing who was left out.', 'They keep one message they will never send.'].map((line, i) => <div key={line} className="flex gap-3 border-b border-[hsl(var(--border))] pb-4 text-sm leading-6"><span className="font-mono-ui text-xs text-[hsl(var(--secondary))]">0{i + 1}</span><span>{line}</span></div>)}</div>
                <div className="mt-8 flex items-center justify-between font-mono-ui text-[9px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]"><span>made with Fictual</span><span>keep / change / play</span></div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-7 rotate-[-9deg] rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--accent))] px-4 py-3 font-display text-lg font-bold paper-shadow">for the lore-hoarders</div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 lg:px-8"><AdSlot label="A little breathing room · future tool sponsor" /></div>

      <section id="tools" className="scroll-mt-24 px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionEyebrow>the growing shelf</SectionEyebrow>
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><h2 className="max-w-xl font-display text-4xl font-bold leading-tight tracking-[-.045em] md:text-5xl">Small prompts. <em className="font-normal text-[hsl(var(--secondary))]">Big consequences.</em></h2><p className="max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">Start with a detail. Give it somewhere to go. More tools are making their way onto the shelf.</p></div>
          <div className="mt-12 grid gap-5 md:grid-cols-[1.35fr_.65fr]">
            <Link href="/tools/headcanon-generator" className="group relative min-h-[340px] overflow-hidden rounded-[1.7rem] border border-[hsl(var(--border))] bg-[hsl(var(--primary))] p-7 text-[hsl(var(--primary-foreground))] paper-shadow transition hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(47,112,96,.2)]" data-testid="card-headcanon-tool">
              <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full border-[34px] border-[hsl(var(--accent)/.8)]" /><div className="absolute bottom-[-5rem] right-16 h-48 w-48 rounded-full border-[22px] border-[hsl(var(--secondary)/.8)]" />
              <div className="relative flex h-full flex-col justify-between"><div><span className="font-mono-ui text-[10px] uppercase tracking-[.18em] opacity-70">01 / generator</span><h3 className="mt-12 max-w-md font-display text-4xl font-bold leading-[.98] tracking-[-.05em]">Give your character one more thing to hide.</h3></div><div className="flex items-center justify-between"><span className="text-sm opacity-75">Five specific sparks, ready to keep or reroll.</span><span className="grid h-11 w-11 place-items-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] transition group-hover:rotate-[-8deg]"><ArrowRight size={19} /></span></div></div>
            </Link>
            <div className="grid gap-5">
              <Link href="/tools/genshin-impact-headcanon-generator" className="group flex min-h-[157px] flex-col justify-between rounded-[1.7rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 paper-shadow transition hover:-translate-y-1" data-testid="card-genshin-tool"><div className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--secondary)/.2)] text-[hsl(var(--secondary))]"><Star size={20} /></span><ChevronRight className="text-[hsl(var(--muted-foreground))] transition group-hover:translate-x-1" /></div><div><h3 className="font-display text-2xl font-bold tracking-[-.04em]">Genshin Impact</h3><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">A fandom doorway into the same little machine.</p></div></Link>
              <div className="flex min-h-[157px] flex-col justify-between rounded-[1.7rem] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted)/.28)] p-6"><div className="flex items-center justify-between"><span className="font-mono-ui text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">coming soon</span><Library size={20} className="text-[hsl(var(--muted-foreground))]" /></div><div><h3 className="font-display text-2xl font-bold tracking-[-.04em]">More shelves soon</h3><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">OC names, scene seeds, relationship maps.</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 border-y border-[hsl(var(--border))] bg-[hsl(var(--card)/.4)] px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.72fr_1.28fr]"><div><SectionEyebrow>how it works</SectionEyebrow><h2 className="font-display text-4xl font-bold leading-tight tracking-[-.05em] md:text-5xl">A writing prompt with <em className="font-normal text-[hsl(var(--primary))]">somewhere to land.</em></h2><p className="mt-5 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">No accounts. No complicated setup. Just a small nudge toward the detail that makes a character feel like they existed before page one.</p></div><div className="grid gap-8 sm:grid-cols-3">{[['01', 'Name the person', 'Add a character name if you have one. Or let the prompt arrive unaddressed.'], ['02', 'Make five sparks', 'Fictual pulls from five shelves: personality, history, habits, bonds, and secrets.'], ['03', 'Keep what catches', 'Lock a favorite, reroll the rest, then save or export the set when it feels like yours.']].map(([num, title, copy]) => <div key={num} className="border-t-2 border-[hsl(var(--primary))] pt-4"><span className="font-mono-ui text-xs text-[hsl(var(--secondary))]">{num}</span><h3 className="mt-7 font-display text-2xl font-bold tracking-[-.035em]">{title}</h3><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{copy}</p></div>)}</div></div>
      </section>

      <section id="faq" className="scroll-mt-24 px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-3xl"><SectionEyebrow>questions from the margins</SectionEyebrow><h2 className="font-display text-4xl font-bold tracking-[-.05em] md:text-5xl">Good questions make <em className="font-normal text-[hsl(var(--secondary))]">good characters.</em></h2><div className="mt-10 space-y-3">{faqItems.map((item, i) => <FaqItem key={item.q} {...item} index={i} />)}</div></div></section>
    </main>
    <Footer />
  </div>;
}

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return <div className="border-b border-[hsl(var(--border))]"><button className="flex w-full items-center justify-between gap-5 py-5 text-left font-display text-xl font-bold tracking-[-.025em]" onClick={() => setOpen(!open)} aria-expanded={open} data-testid={`button-faq-${index}`}><span>{q}</span><ChevronDown size={20} className={`shrink-0 text-[hsl(var(--primary))] transition ${open ? 'rotate-180' : ''}`} /></button>{open && <p className="max-w-2xl pb-6 pr-10 text-sm leading-7 text-[hsl(var(--muted-foreground))]">{a}</p>}</div>;
}

function Footer() {
  return <footer className="border-t border-[hsl(var(--border))] px-5 py-10 lg:px-8"><div className="mx-auto flex max-w-6xl flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><Logo /><p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">A small studio for the details that follow you home.</p></div><div className="font-mono-ui text-[10px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Fictual · made for making things up</div></div></footer>;
}

function getInitialResults(): Result[] {
  return categories.map((category, index) => ({ id: `${category.toLowerCase()}-${index}-${Date.now()}`, category, text: templates[category][index], locked: false, saved: false }));
}

function HeadcanonTool({ fandom = false }: { fandom?: boolean }) {
  const pageTitle = fandom ? 'Genshin Impact Headcanon Generator' : 'Headcanon Generator';
  usePageMeta(pageTitle, fandom ? 'Make specific, character-forward Genshin Impact headcanons for your next fic, roleplay, or lore deep dive.' : 'Generate five specific headcanons for any fanfiction, original character, or roleplay character. Save and export your favorite details.', faqItems);
  const [name, setName] = useState('');
  const [results, setResults] = useState<Result[]>(getInitialResults);
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('fictual-saved-headcanons') || '[]') as SavedItem[]; } catch { return []; }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);
  const resultAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => { try { localStorage.setItem('fictual-saved-headcanons', JSON.stringify(savedItems)); } catch { /* private browsing can deny storage */ } }, [savedItems]);

  const savedCount = savedItems.length;
  const labelName = name.trim() || 'your character';

  const generate = () => {
    setIsGenerating(true);
    window.setTimeout(() => {
      setResults(current => current.map((result, index) => {
        if (result.locked) return result;
        const pool = templates[result.category];
        const currentTexts = current.map(item => item.text);
        const candidates = pool.filter(text => !currentTexts.includes(text));
        const next = candidates[Math.floor(Math.random() * candidates.length)] || pool[(index + Math.floor(Math.random() * pool.length)) % pool.length];
        return { ...result, id: `${result.category.toLowerCase()}-${Date.now()}-${index}`, text: next, saved: false };
      }));
      setIsGenerating(false);
      setNotice('Fresh sparks are ready. Locked details stayed put.');
      window.setTimeout(() => setNotice(''), 2800);
    }, 360);
  };

  const toggleLock = (id: string) => setResults(items => items.map(item => item.id === id ? { ...item, locked: !item.locked } : item));
  const saveResult = (result: Result) => {
    const existing = savedItems.some(item => item.text === result.text && item.name === labelName);
    if (existing) {
      setSavedItems(items => items.filter(item => !(item.text === result.text && item.name === labelName)));
      setResults(items => items.map(item => item.id === result.id ? { ...item, saved: false } : item));
      setNotice('Removed from your saved shelf.');
    } else {
      setSavedItems(items => [{ id: `${Date.now()}-${result.category}`, category: result.category, text: result.text, name: labelName, createdAt: new Date().toISOString() }, ...items]);
      setResults(items => items.map(item => item.id === result.id ? { ...item, saved: true } : item));
      setNotice('Saved to your local shelf.');
    }
    window.setTimeout(() => setNotice(''), 2200);
  };
  const exportCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200; canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#f7f1e6'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#d1e4df'; ctx.beginPath(); ctx.arc(1040, 90, 250, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f2c5b5'; ctx.beginPath(); ctx.arc(50, 1510, 185, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2f7060'; ctx.fillRect(72, 72, 1056, 1);
    ctx.fillStyle = '#2f7060'; ctx.font = '500 22px "DM Mono", monospace'; ctx.fillText('FICTUAL / CHARACTER NOTE', 74, 125);
    ctx.fillStyle = '#2d2938'; ctx.font = '700 75px "Playfair Display", Georgia, serif'; wrapText(ctx, labelName, 74, 260, 920, 88);
    ctx.fillStyle = '#7a7069'; ctx.font = '400 22px "DM Sans", sans-serif'; ctx.fillText(fandom ? 'Genshin Impact headcanon set' : 'a five-part headcanon set', 78, 360);
    let y = 480;
    results.forEach((item, index) => {
      ctx.fillStyle = '#b66d59'; ctx.font = '500 18px "DM Mono", monospace'; ctx.fillText(`0${index + 1}  ${item.category.toUpperCase()}`, 80, y);
      ctx.fillStyle = '#2d2938'; ctx.font = '400 29px "DM Sans", sans-serif'; y = wrapText(ctx, item.text, 80, y + 47, 970, 42) + 90;
      ctx.strokeStyle = '#d8cdbb'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(80, y - 44); ctx.lineTo(1120, y - 44); ctx.stroke();
    });
    ctx.fillStyle = '#7a7069'; ctx.font = '400 18px "DM Mono", monospace'; ctx.fillText('fictual.tools  /  keep what catches', 80, 1515);
    const link = document.createElement('a'); link.download = `${labelName.toLowerCase().replace(/\s+/g, '-')}-headcanons.png`; link.href = canvas.toDataURL('image/png'); link.click();
    setNotice('Your character card is downloading.');
    window.setTimeout(() => setNotice(''), 2500);
  };
  const copySet = async () => {
    await navigator.clipboard?.writeText(`${labelName}\n\n${results.map((r, i) => `${i + 1}. ${r.text}`).join('\n')}`);
    setCopied(true); window.setTimeout(() => setCopied(false), 1800);
  };

  return <div className="grain min-h-dvh"><Header /><main>
    <section className="relative overflow-hidden border-b border-[hsl(var(--border))] px-5 pb-10 pt-12 lg:px-8 lg:pb-14 lg:pt-20">
      <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-[hsl(var(--accent)/.28)] blur-3xl" />
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]"><Link href="/" className="hover:text-[hsl(var(--primary))]" data-testid="link-breadcrumb-home">Fictual</Link><ChevronRight size={13} /><span>Tools</span><ChevronRight size={13} /><span className="text-[hsl(var(--primary))]">{fandom ? 'Genshin Impact' : 'Headcanon generator'}</span></div>
        <div className="mt-10 grid items-end gap-8 lg:grid-cols-[1fr_auto]"><div><div className="reveal inline-flex items-center gap-2 rounded-full bg-[hsl(var(--secondary)/.14)] px-3 py-1.5 font-mono-ui text-[10px] uppercase tracking-[.15em] text-[hsl(var(--secondary))]"><WandSparkles size={13} /> {fandom ? 'for the teyvat-minded' : 'the little detail machine'}</div><h1 className="reveal reveal-delay-1 mt-5 max-w-3xl font-display text-[clamp(3rem,7vw,6rem)] font-bold leading-[.93] tracking-[-.065em]">{fandom ? <>Genshin Impact <em className="font-normal text-[hsl(var(--primary))]">headcanons.</em></> : <>A little more <em className="font-normal text-[hsl(var(--primary))]">character.</em></>}</h1><p className="reveal reveal-delay-2 mt-5 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{fandom ? 'For the travelers, vision-holders, and suspiciously specific NPCs living rent-free in your head.' : 'Five short, specific sparks for fanfiction, original characters, and roleplay. Keep the ones that sound like them.'}</p></div><div className="hidden rotate-[-4deg] rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--accent))] px-5 py-4 text-center paper-shadow lg:block"><div className="font-mono-ui text-[10px] uppercase tracking-[.16em]">saved locally</div><div className="mt-1 font-display text-3xl font-bold">{savedCount.toString().padStart(2, '0')}</div><div className="text-xs">details in your shelf</div></div></div>
      </div>
    </section>
    <div className="mx-auto max-w-6xl px-5 lg:px-8"><AdSlot label="reserved studio space · never interrupts your writing" /></div>
    <section className="px-5 pb-20 lg:px-8 lg:pb-28"><div className="mx-auto max-w-6xl">
      <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
        <aside className="h-fit rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 paper-shadow lg:sticky lg:top-24">
          <div className="flex items-center justify-between"><div><div className="font-mono-ui text-[10px] uppercase tracking-[.15em] text-[hsl(var(--primary))]">your character</div><h2 className="mt-2 font-display text-2xl font-bold">Start with a name.</h2></div><Lightbulb size={22} className="text-[hsl(var(--secondary))]" /></div>
          <label className="mt-7 block text-sm font-semibold" htmlFor="character-name">Character name <span className="font-normal text-[hsl(var(--muted-foreground))]">(optional)</span></label>
          <input id="character-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rowan Vale" className="mt-2 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 py-3 text-sm outline-none transition placeholder:text-[hsl(var(--muted-foreground)/.7)] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/.18)]" data-testid="input-character-name" />
          <p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">A name makes the exported card feel like theirs. Leave it blank for a general set.</p>
          <button onClick={generate} disabled={isGenerating} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-75" data-testid="button-generate">{isGenerating ? <><RotateCw size={16} className="animate-spin" /> Finding details...</> : <><WandSparkles size={16} /> Generate five sparks</>}</button>
          <div className="mt-4 flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]"><span className="flex items-center gap-1.5"><LockKeyhole size={13} /> Locked results stay put</span><span>{results.filter(r => r.locked).length}/5 locked</span></div>
          <div className="mt-7 border-t border-[hsl(var(--border))] pt-5"><div className="flex items-center gap-2 text-sm font-bold"><Save size={15} className="text-[hsl(var(--primary))]" />Your saved shelf</div><p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{savedCount ? `${savedCount} detail${savedCount === 1 ? '' : 's'} tucked away in this browser.` : 'Favorite a result and it will live here, no login required.'}</p><Link href="#saved" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--primary))]" data-testid="link-saved-shelf">View saved ideas <ArrowRight size={13} /></Link></div>
        </aside>
        <div ref={resultAreaRef} className="min-w-0">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><div className="font-mono-ui text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">five places to look</div><h2 className="mt-1 font-display text-3xl font-bold tracking-[-.04em]">{labelName}'s loose threads</h2></div><div className="flex gap-2"><button onClick={copySet} className="flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-bold transition hover:bg-[hsl(var(--muted))]" data-testid="button-copy-set">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy set'}</button><button onClick={exportCard} className="flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-bold transition hover:bg-[hsl(var(--muted))]" data-testid="button-export-card"><Download size={14} />Export card</button></div></div>
          {notice && <div className="mb-4 rounded-xl border border-[hsl(var(--primary)/.2)] bg-[hsl(var(--primary)/.08)] px-4 py-3 text-sm font-semibold text-[hsl(var(--primary))]" role="status" data-testid="status-notice">{notice}</div>}
          <div className="grid gap-3">{results.map((result, index) => <ResultCard key={result.id} result={result} index={index} onLock={() => toggleLock(result.id)} onSave={() => saveResult(result)} isGenerating={isGenerating} />)}</div>
          <div className="mt-5 flex items-center justify-between rounded-xl border border-dashed border-[hsl(var(--border))] px-4 py-3"><span className="text-xs text-[hsl(var(--muted-foreground))]">Like four of them? Lock your favorite, then reroll the rest.</span><button onClick={generate} className="flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--primary))]" data-testid="button-reroll-unlocked"><RotateCw size={14} /> Reroll unlocked</button></div>
        </div>
      </div>
      <SavedShelf savedItems={savedItems} onRemove={item => setSavedItems(items => items.filter(saved => saved.id !== item.id))} />
    </div></section>
    <section className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card)/.4)] px-5 py-20 lg:px-8"><div className="mx-auto max-w-6xl"><div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]"><div><SectionEyebrow>the tiny glossary</SectionEyebrow><h2 className="font-display text-4xl font-bold tracking-[-.05em]">What makes a <em className="font-normal text-[hsl(var(--secondary))]">headcanon?</em></h2></div><div className="grid gap-5 sm:grid-cols-2">{faqItems.slice(0, 2).map((item, i) => <div key={item.q} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><CircleHelp size={19} className="text-[hsl(var(--primary))]" /><h3 className="mt-5 font-display text-xl font-bold">{item.q}</h3><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{item.a}</p></div>)}</div></div></div></section>
    <div className="mx-auto max-w-6xl px-5 lg:px-8"><AdSlot label="another quiet corner · future tools may live here" /></div>
  </main><Footer /></div>;
}

function ResultCard({ result, index, onLock, onSave, isGenerating }: { result: Result; index: number; onLock: () => void; onSave: () => void; isGenerating: boolean }) {
  const Icon = categoryIcons[result.category];
  return <article className={`result-in group relative rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 transition hover:paper-shadow ${isGenerating ? 'opacity-60' : ''}`} style={{ animationDelay: `${index * 45}ms` }} data-testid={`card-result-${index}`}><div className="flex gap-4"><div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${palette[result.category]}`}><Icon size={18} /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className={`rounded-full px-2 py-1 font-mono-ui text-[9px] uppercase tracking-[.12em] ${palette[result.category]}`}>{result.category}</span>{result.locked && <span className="flex items-center gap-1 font-mono-ui text-[9px] uppercase tracking-[.1em] text-[hsl(var(--primary))]"><LockKeyhole size={11} /> locked</span>}</div><p className="mt-3 max-w-2xl text-[15px] leading-7">{result.text}</p></div><div className="flex shrink-0 items-start gap-1"><button onClick={onSave} aria-label={result.saved ? 'Remove from saved ideas' : 'Save this headcanon'} className={`rounded-lg p-2 transition hover:bg-[hsl(var(--muted))] ${result.saved ? 'text-[hsl(var(--secondary))]' : 'text-[hsl(var(--muted-foreground))]'}`} data-testid={`button-save-result-${index}`}>{result.saved ? <Heart size={17} fill="currentColor" /> : <Bookmark size={17} />}</button><button onClick={onLock} aria-label={result.locked ? 'Unlock this headcanon' : 'Lock this headcanon'} className={`rounded-lg p-2 transition hover:bg-[hsl(var(--muted))] ${result.locked ? 'bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`} data-testid={`button-lock-result-${index}`}><LockKeyhole size={17} /></button></div></div></article>;
}

function SavedShelf({ savedItems, onRemove }: { savedItems: SavedItem[]; onRemove: (item: SavedItem) => void }) {
  return <section id="saved" className="scroll-mt-24 mt-20 border-t border-[hsl(var(--border))] pt-10"><div className="flex items-end justify-between gap-4"><div><SectionEyebrow>your local shelf</SectionEyebrow><h2 className="font-display text-3xl font-bold tracking-[-.04em]">Saved ideas <span className="font-normal text-[hsl(var(--muted-foreground))]">({savedItems.length})</span></h2></div><span className="hidden text-xs text-[hsl(var(--muted-foreground))] sm:block">Only stored in this browser</span></div>{savedItems.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-[hsl(var(--border))] p-8 text-center"><Bookmark size={22} className="mx-auto text-[hsl(var(--muted-foreground))]" /><p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">Your shelf is waiting for a detail that feels like them.</p></div> : <div className="mt-6 grid gap-3 md:grid-cols-2">{savedItems.map(item => <div key={item.id} className="group rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"><div className="flex items-start justify-between gap-4"><span className={`rounded-full px-2 py-1 font-mono-ui text-[9px] uppercase tracking-[.12em] ${palette[item.category]}`}>{item.category}</span><button onClick={() => onRemove(item)} className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] opacity-0 transition hover:bg-[hsl(var(--muted))] group-hover:opacity-100" aria-label="Remove saved headcanon" data-testid={`button-remove-saved-${item.id}`}><X size={15} /></button></div><p className="mt-3 text-sm leading-6">{item.text}</p><p className="mt-3 font-mono-ui text-[9px] uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]">{item.name}</p></div>)}</div>}</section>;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' '); let line = ''; let currentY = y;
  words.forEach(word => { const test = `${line}${word} `; if (ctx.measureText(test).width > maxWidth && line) { ctx.fillText(line.trim(), x, currentY); line = `${word} `; currentY += lineHeight; } else line = test; });
  if (line) { ctx.fillText(line.trim(), x, currentY); currentY += lineHeight; } return currentY;
}

function NotFound() {
  usePageMeta('Page not found', 'This Fictual page wandered off the shelf.');
  return <div className="grain min-h-dvh"><Header /><main className="mx-auto max-w-3xl px-5 py-32 text-center"><div className="mx-auto grid h-16 w-16 rotate-[-8deg] place-items-center rounded-2xl bg-[hsl(var(--accent))] paper-shadow"><Info /></div><h1 className="mt-8 font-display text-6xl font-bold tracking-[-.06em]">This page wandered off.</h1><p className="mx-auto mt-5 max-w-md text-[hsl(var(--muted-foreground))]">The shelf is still growing, but this particular page is not on it.</p><Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="link-not-found-home">Return to Fictual <ArrowRight size={15} /></Link></main></div>;
}

function Router() {
  const [location] = useLocation();
  return <Switch location={location}><Route path="/" component={Home} /><Route path="/tools/headcanon-generator"><HeadcanonTool /></Route><Route path="/tools/genshin-impact-headcanon-generator"><HeadcanonTool fandom /></Route><Route component={NotFound} /></Switch>;
}

export default function App() {
  return <TooltipProvider><Router /><Toaster /></TooltipProvider>;
}