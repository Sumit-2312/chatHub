import type { IconType } from "react-icons";

function SidebarItem({
  icon: Icon,
  isActive,
  onClick,
  title
}: {
  icon: IconType;
  isActive: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <div
      onClick={onClick}
      title={title}
      className="hover:cursor-pointer flex py-2 w-full items-center justify-center text-white hover:bg-gray-900 transition-colors duration-200"
    >
      {Icon && <Icon className={`h-5 w-5 ${isActive ? "text-blue-500" : "text-white"}`}/>}
    </div>
  );
}

export default SidebarItem;
