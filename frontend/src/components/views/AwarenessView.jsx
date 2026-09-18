import MicroTraining from '../MicroTraining';

export default function AwarenessView({ activeTrainingData }) {
  const awarenessModules = [
    {
      id: 'brand-stacking',
      title: 'Deceptive Brand Stacking',
      vector: 'Subdomain Spoofing',
      level: 'High Risk',
      description: 'Attackers embed legitimate brand names into subdomains (e.g. paypal.com.account-verify.xyz) to deceive users who scan URLs quickly.',
      tip: 'Check the domain immediately before the TLD (.xyz, .com). In "paypal.com.verify.net", the real host is "verify.net", NOT PayPal.',
    },
    {
      id: 'entropy-dga',
      title: 'High-Entropy DGA Queries',
      vector: 'C2 Beaconing',
      level: 'Critical',
      description: 'Malware uses Domain Generation Algorithms (DGA) to create random domain names (e.g. x94m-sync-update.biz) for command-and-control servers.',
      tip: 'Block unauthenticated high-entropy DNS TXT and A-record lookups across enterprise firewalls.',
    },
    {
      id: 'raw-ip-post',
      title: 'Raw IP Credential Exfiltration',
      vector: 'Unencrypted POST',
      level: 'High Risk',
      description: 'Phishing forms POST victim credentials directly to external raw IP addresses (e.g. 185.220.101.5) without HTTPS SSL validation.',
      tip: 'Never submit login credentials or MFA tokens on forms hosted directly on numerical IP addresses.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display text-white tracking-wide">Cyber Awareness & Threat Knowledge Hub</h2>
        <p className="text-xs font-sans text-neutral-400 mt-0.5">Interactive security training modules based on real threat vectors</p>
      </div>

      {/* Active Scan Micro-Training if present */}
      {activeTrainingData && (
        <section className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-400">Scan Context Module</span>
          <MicroTraining trainingData={activeTrainingData} />
        </section>
      )}

      {/* Knowledge Base Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {awarenessModules.map((mod) => (
          <div key={mod.id} className="nexus-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-800">
                {mod.vector}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-red-500">
                {mod.level}
              </span>
            </div>

            <h3 className="text-lg font-display text-white tracking-wide">{mod.title}</h3>
            <p className="text-xs font-sans text-neutral-400 leading-relaxed">{mod.description}</p>

            <div className="pt-2 border-t border-neutral-800 text-xs font-sans text-neutral-300 flex items-start gap-2">
              <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{mod.tip}</span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
