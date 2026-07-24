"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_CONTENT } from "@/lib/content";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={3} />
    </div>
  );
}

export default function ContentPage() {
  const [c, setC] = useState<any>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setC(j.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (section: string, field: string, value: any) =>
    setC((p: any) => ({ ...p, [section]: { ...p[section], [field]: value } }));

  const setStat = (i: number, field: string, value: any) =>
    setC((p: any) => {
      const stats = [...p.impact.stats];
      stats[i] = { ...stats[i], [field]: value };
      return { ...p, impact: { ...p.impact, stats } };
    });

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c),
      });
      if (res.ok) toast.success("Website content saved — it's live on the site");
      else toast.error("Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight">Website Content</h1>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-14 lg:top-[60px] bg-background/95 backdrop-blur py-4 z-10 border-b sm:border-none">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Website Content</h1>
          <p className="text-sm text-muted-foreground">
            Edit homepage text without touching code. Changes go live immediately.
          </p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Section title="Hero">
        <Field label="Badge" value={c.hero.badge} onChange={(v) => set("hero", "badge", v)} />
        <Field label="Headline" value={c.hero.title} onChange={(v) => set("hero", "title", v)} />
        <Field
          label="Revealed Headline (after clicking Color the Lives)"
          value={c.hero.coloredTitle}
          onChange={(v) => set("hero", "coloredTitle", v)}
        />
      </Section>

      <Section title="About the Founder">
        <Field label="Heading" value={c.about.heading} onChange={(v) => set("about", "heading", v)} />
        <Field label="Founder Name" value={c.about.name} onChange={(v) => set("about", "name", v)} />
        <Area label="Paragraph 1" value={c.about.para1} onChange={(v) => set("about", "para1", v)} />
        <Area label="Paragraph 2" value={c.about.para2} onChange={(v) => set("about", "para2", v)} />
        <Area label="Quote" value={c.about.quote} onChange={(v) => set("about", "quote", v)} />
      </Section>

      <Section title="Mission">
        <Field label="Heading" value={c.mission.heading} onChange={(v) => set("mission", "heading", v)} />
        <Area label="Description" value={c.mission.description} onChange={(v) => set("mission", "description", v)} />
      </Section>

      <Section title="Impact & Statistics">
        <Field label="Heading" value={c.impact.heading} onChange={(v) => set("impact", "heading", v)} />
        <Area label="Quote" value={c.impact.quote} onChange={(v) => set("impact", "quote", v)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {c.impact.stats.map((s: any, i: number) => (
            <div key={i} className="border rounded-md p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Value</Label>
                  <Input type="number" value={s.value} onChange={(e) => setStat(i, "value", Number(e.target.value))} />
                </div>
                <div>
                  <Label className="text-xs">Suffix</Label>
                  <Input value={s.suffix} onChange={(e) => setStat(i, "suffix", e.target.value)} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Label</Label>
                <Input value={s.label} onChange={(e) => setStat(i, "label", e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Testimonial">
        <Area label="Quote" value={c.testimonial.quote} onChange={(v) => set("testimonial", "quote", v)} />
        <Field label="Author" value={c.testimonial.author} onChange={(v) => set("testimonial", "author", v)} />
        <Field label="Role" value={c.testimonial.role} onChange={(v) => set("testimonial", "role", v)} />
      </Section>

      <Section title="Contact">
        <Field label="Heading" value={c.contact.heading} onChange={(v) => set("contact", "heading", v)} />
        <Area label="Description" value={c.contact.description} onChange={(v) => set("contact", "description", v)} />
        <Field label="Email" value={c.contact.email} onChange={(v) => set("contact", "email", v)} />
        <Field label="Phone" value={c.contact.phone} onChange={(v) => set("contact", "phone", v)} />
        <Field label="Address" value={c.contact.address} onChange={(v) => set("contact", "address", v)} />
      </Section>

      <Section title="Social Links">
        <Field label="Facebook URL" value={c.socials.facebook} onChange={(v) => set("socials", "facebook", v)} />
        <Field label="Instagram URL" value={c.socials.instagram} onChange={(v) => set("socials", "instagram", v)} />
        <Field label="Twitter / X URL" value={c.socials.twitter} onChange={(v) => set("socials", "twitter", v)} />
      </Section>

      <Section title="Footer">
        <Area label="Description" value={c.footer.description} onChange={(v) => set("footer", "description", v)} />
      </Section>

      <div className="flex justify-end pb-6">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
