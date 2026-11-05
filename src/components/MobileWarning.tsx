interface MobileWarningProps {
  onContinue: () => void;
}

const MobileWarning = ({ onContinue }: MobileWarningProps) => (
  <div className="mobile-warning">
    <p>
      This app isn't built for mobile — it relies on desktop browser features (WebAssembly threads, Web Audio) that mobile browsers often don't support well, so it may not run correctly here.
    </p>
    <button onClick={onContinue}>Continue anyway</button>
  </div>
);

export default MobileWarning;
