export type Tab = "controls" | "about";

interface TabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const TabBar = ({ activeTab, onTabChange, isPlaying, onTogglePlay }: TabBarProps) => (
  <div className="button-row">
    <button
      className={activeTab === "controls" ? "active" : ""}
      onClick={() => onTabChange("controls")}
    >
      Controls
    </button>
    <button
      className={activeTab === "about" ? "active" : ""}
      onClick={() => onTabChange("about")}
    >
      About
    </button>
    <button onClick={onTogglePlay}>{isPlaying ? "Stop" : "Play"}</button>
  </div>
);

export default TabBar;
