import { cn } from "@/utils/cn";

type CollapsibleDirection = "vertical" | "horizontal";

interface CollapsibleProps {
  readonly isOpen: boolean;
  readonly direction?: CollapsibleDirection;
  readonly children: React.ReactNode;
}

/**
 * Hệ thống hiệu ứng thu/mở dùng chung toàn web:
 * - vertical: Co giãn chiều cao thực 0fr -> 1fr (dùng cho accordion, danh sách, chi tiết).
 * - horizontal: Co giãn chiều ngang 0fr -> 1fr (dùng cho thanh công cụ & Header thông minh trên PC).
 */
export function Collapsible({
  isOpen,
  direction = "vertical",
  children,
}: CollapsibleProps) {
  const isHorizontal = direction === "horizontal";

  return (
    <div
      data-open={isOpen}
      aria-hidden={!isOpen}
      className={cn(isHorizontal ? "motion-morph-x" : "motion-accordion-y")}
    >
      <div
        className={cn(
          isHorizontal ? "motion-morph-x-inner" : "motion-accordion-y-inner",
        )}
      >
        {children}
      </div>
    </div>
  );
}
