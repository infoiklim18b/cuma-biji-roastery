import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserId } from "@/lib/use-user";
import { useNavigate } from "@tanstack/react-router";

export function WishlistButton({
  productId,
  variant = "icon",
}: {
  productId: string;
  variant?: "icon" | "button";
}) {
  const { userId } = useUserId();
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle()
      .then(({ data }) => setActive(!!data));
  }, [userId, productId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) {
      toast.info("Masuk dulu untuk menyimpan ke wishlist.");
      navigate({ to: "/auth" });
      return;
    }
    setBusy(true);
    try {
      if (active) {
        await supabase.from("wishlist").delete().eq("user_id", userId).eq("product_id", productId);
        setActive(false);
        toast.success("Dihapus dari wishlist");
      } else {
        await supabase.from("wishlist").insert({ user_id: userId, product_id: productId });
        setActive(true);
        toast.success("Disimpan ke wishlist");
      }
      qc.invalidateQueries({ queryKey: ["wishlist", userId] });
    } catch {
      toast.error("Gagal memperbarui wishlist");
    } finally {
      setBusy(false);
    }
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-5 py-3 text-sm hover:bg-[color:var(--secondary)] disabled:opacity-50"
      >
        <Heart className={`h-4 w-4 ${active ? "fill-[color:var(--coffee)] text-[color:var(--coffee)]" : ""}`} />
        {active ? "Tersimpan" : "Wishlist"}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label="Wishlist"
      className="grid h-9 w-9 place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--background)]/90 backdrop-blur hover:bg-[color:var(--cream)]"
    >
      <Heart
        className={`h-4 w-4 ${active ? "fill-[color:var(--coffee)] text-[color:var(--coffee)]" : "text-[color:var(--coffee)]"}`}
      />
    </button>
  );
}
