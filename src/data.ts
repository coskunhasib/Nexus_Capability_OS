export type NodeType = 'Root' | 'Architecture' | 'Macro Pipeline' | 'Micro Pipeline' | 'Profile Family' | 'Layer' | 'Skill' | 'Tool' | 'Runtime' | 'Memory/Context' | 'Gate' | 'Stage';

export interface TreeNode {
  id: string;
  type: NodeType;
  title: string;
  mini?: string;
  desc?: string;
  bullets?: string[];
  tags?: string[];
  gates?: string[];
  children?: TreeNode[];
}

export const treeData: TreeNode = {
  id: 'root', type: 'Root', title: 'Nexus Capability OS', mini: 'Capability Compiler tabanlı skill / tool / plugin / agent işletim katmanı',
  desc: 'İş tipini anlayıp uygun takım profili, macro/micro pipeline, skill-tool-plugin-agent seti, quality gates ve memory-context davranışını derleyen üst mimari.',
  bullets: ['Merkez kavram: Capability Compiler', 'Çok disiplinli takım derleme mantığı', 'Macro ve micro pipeline ailelerini birlikte taşır', 'Ürünleşebilir capability layer yaklaşımı'],
  tags: ['Capability OS', 'Compiler', 'Pipelines', 'Profiles', 'Agents'], gates: ['architecture coherence', 'quality-first'],
  children: [
    {
      id: 'compiler', type: 'Architecture', title: 'Capability Compiler', mini: 'Intent → Team → Pipeline → Pack Assembly', desc: 'Kullanıcı niyetini alır; uygun macro pipeline ailesini, team profile setini, agent pack’i ve quality gate’leri derler.', bullets: ['Intent intake', 'Team compiler', 'Pipeline selector', 'Pack assembler', 'Gate injector'], tags: ['compiler', 'team builder'], gates: ['correct assembly'], children: [
        { id: 'intent', type: 'Architecture', title: 'Intent Intake', mini: 'İş tipini ve hedefi çözer', desc: 'Problem tipi, hedef çıktı ve kısıtları çıkarır.', bullets: ['brief', 'goal', 'constraints'], tags: ['intake'], gates: ['clarity'] },
        { id: 'team-compiler', type: 'Architecture', title: 'Team Compiler', mini: 'Doğru profil kombinasyonunu seçer', desc: 'Core roller + domain roller + review roller setini seçer.', bullets: ['role coverage', 'no role gaps'], tags: ['profiles', 'roles'], gates: ['coverage'] },
        { id: 'pipeline-selector', type: 'Architecture', title: 'Pipeline Selector', mini: 'Macro ve micro akışları bağlar', desc: 'İşe uygun macro family ve ona bağlı micro pipeline setini eşler.', bullets: ['family selection', 'micro selection'], tags: ['macro', 'micro'], gates: ['sequence integrity'] },
        { id: 'pack-assembler', type: 'Architecture', title: 'Pack Assembler', mini: 'Skill / tool / plugin / agent seti', desc: 'Seçilen takım ve pipeline’a göre capability paketlerini bağlar.', bullets: ['skills', 'tools', 'plugins', 'contracts'], tags: ['pack'], gates: ['compatibility'] },
        { id: 'gate-injector', type: 'Architecture', title: 'Quality Gate Injector', mini: 'Gerekli kontrol kapılarını yerleştirir', desc: 'Spec, quality, security, performance, release ve memory gate’lerini aşamalara yerleştirir.', bullets: ['spec gate', 'quality gate', 'security gate'], tags: ['gates'], gates: ['independent review'] }
      ]
    },

    {
      id: 'macro-families', type: 'Architecture', title: 'Macro Pipeline Families', mini: 'Büyük iş aileleri', desc: 'Sistemdeki ana iş aileleri. Her biri altında domain/micro pipeline’lar taşır.', bullets: ['Top-level business/engineering/workflow kümeleri', 'Her ailenin alt mikro akışları vardır'], tags: ['macro families'], gates: ['family completeness'], children: [
        {
          id: 'software', type: 'Macro Pipeline', title: 'Software Development', mini: 'Web, backend, mobile, platform, agentic system', desc: 'Yazılım geliştirme ailesi; web frontend/backend, mobile, database, DevOps, QA automation, docs/SDK, AI app ve agentic system akışlarını kapsar.', bullets: ['Önce domain, sonra platform, sonra stack', 'Review ve verification bütün dallarda ortak'], tags: ['frontend', 'backend', 'mobile', 'qa', 'agentic'], gates: ['spec', 'test', 'security'], children: [
            { id: 'frontend-web', type: 'Micro Pipeline', title: 'Frontend Web', mini: 'UI, state, responsive, accessibility', desc: 'Component tree, state modeli, API contract, loading-empty-error states ve visual review.', bullets: ['Component tree', 'State', 'Responsive', 'A11y'], tags: ['UI', 'responsive', 'A11y'], gates: ['UI state coverage'] },
            { id: 'backend-api', type: 'Micro Pipeline', title: 'Backend / API', mini: 'Domain, auth, validation, docs', desc: 'API contract, data model, validation, auth, business logic, tests ve docs.', bullets: ['API contract', 'Validation', 'Auth', 'Docs'], tags: ['API', 'service'], gates: ['security review'] },
            { id: 'fullstack', type: 'Micro Pipeline', title: 'Full-stack Web', mini: 'Frontend + backend feature teslimi', desc: 'Tek feature bazında UI, API ve data katmanının birlikte teslimi.', bullets: ['UI/API sync'], tags: ['full-stack'], gates: ['integration fit'] },
            { id: 'mobile', type: 'Micro Pipeline', title: 'Mobile', mini: 'Flutter / RN / native', desc: 'Navigation, device APIs, offline state ve release packaging.', bullets: ['navigation', 'device', 'offline'], tags: ['mobile'], gates: ['release readiness'] },
            { id: 'desktop', type: 'Micro Pipeline', title: 'Desktop', mini: 'Electron / Tauri / native', desc: 'Desktop UX, packaging ve file-system integration.', bullets: ['packaging'], tags: ['desktop'], gates: ['perf'] },
            { id: 'database', type: 'Micro Pipeline', title: 'Database / Data Layer', mini: 'Schema, migration, consistency', desc: 'Şema tasarımı, migration stratejisi ve veri bütünlüğü.', bullets: ['schema', 'migration'], tags: ['db'], gates: ['integrity'] },
            { id: 'integration', type: 'Micro Pipeline', title: 'Integration / Connector', mini: '3rd-party bağlayıcılar', desc: 'Webhook, connector, rate-limit ve secret handling.', bullets: ['webhook', 'secret handling'], tags: ['integration'], gates: ['reliability'] },
            { id: 'devops', type: 'Micro Pipeline', title: 'DevOps / Platform', mini: 'CI/CD, deploy, rollback', desc: 'Environment, deploy, rollback ve observability.', bullets: ['CI/CD', 'rollback', 'monitoring'], tags: ['DevOps'], gates: ['rollback'] },
            { id: 'qa-auto', type: 'Micro Pipeline', title: 'QA Automation', mini: 'Regression ve acceptance', desc: 'Test automation, regression ve acceptance evidence.', bullets: ['regression', 'acceptance'], tags: ['QA'], gates: ['coverage'] },
            { id: 'perf-eng', type: 'Micro Pipeline', title: 'Performance Engineering', mini: 'Latency, load, profiling', desc: 'Performans ölçümü ve darboğaz analizi.', bullets: ['profiling', 'load'], tags: ['performance'], gates: ['baseline'] },
            { id: 'docs-sdk', type: 'Micro Pipeline', title: 'Documentation / SDK', mini: 'API docs ve reusable client', desc: 'API docs, SDK ve integration guides.', bullets: ['docs', 'SDK'], tags: ['docs'], gates: ['clarity'] },
            { id: 'llm-app', type: 'Micro Pipeline', title: 'AI App / LLM App', mini: 'Prompt, tool, RAG, eval', desc: 'LLM tabanlı uygulama akışı.', bullets: ['prompt', 'tool', 'eval'], tags: ['LLM', 'RAG'], gates: ['grounding'] },
            { id: 'agentic-sys', type: 'Micro Pipeline', title: 'Agentic System', mini: 'Memory, context, orchestration, guardrails', desc: 'Agent görev sınırları, tool map, memory/context policy, orchestration ve eval.', bullets: ['agent boundaries', 'guardrails'], tags: ['agentic'], gates: ['tool trust'] },
            { id: 'rpa', type: 'Micro Pipeline', title: 'Browser Automation / RPA', mini: 'Playwright ve task bots', desc: 'Selector reliability, retries ve step-state handling.', bullets: ['selectors', 'retries'], tags: ['RPA'], gates: ['stability'] }
          ]
        },

        {
          id: 'agent-automation', type: 'Macro Pipeline', title: 'AI Automation / n8n / Agent Workflows', mini: 'Workflow-first AI otomasyonu', desc: 'n8n, RAG, NL2SQL, voice assistant, ingestion, OSINT ve content automation akışları.', bullets: ['Workflow orchestration', 'Memory/context contract', 'Tool reliability'], tags: ['n8n', 'automation', 'RAG'], gates: ['eval'], children: [
            { id: 'n8n-core', type: 'Micro Pipeline', title: 'Workflow Orchestration', mini: 'n8n tabanlı akışlar', desc: 'Trigger, branching, retries ve human-in-loop.', bullets: ['trigger', 'retry'], tags: ['n8n'], gates: ['error handling'] },
            { id: 'rag', type: 'Micro Pipeline', title: 'RAG / Knowledge Retrieval', mini: 'Chunking, index, retrieval', desc: 'Belge indeksleme ve grounding testleri.', bullets: ['index', 'retrieval'], tags: ['RAG'], gates: ['grounding'] },
            { id: 'nl2sql', type: 'Micro Pipeline', title: 'NL2SQL', mini: 'Şema anlayan doğal dil sorgu', desc: 'Schema map, query safety ve result explanation.', bullets: ['schema', 'query safety'], tags: ['SQL'], gates: ['query safety'] },
            { id: 'voice-assistant', type: 'Micro Pipeline', title: 'Voice Assistant', mini: 'ASR/TTS + smart-home actions', desc: 'Konuşma tanıma, niyet çözme ve cihaz eylemleri.', bullets: ['ASR', 'actions'], tags: ['voice'], gates: ['action safety'] },
            { id: 'ingestion', type: 'Micro Pipeline', title: 'PDF / GitHub / TXT Ingestion', mini: 'Bilgi besleme akışı', desc: 'Belge/repo parsing ve index aktarımı.', bullets: ['parsing', 'metadata'], tags: ['ingestion'], gates: ['traceability'] },
            { id: 'osint', type: 'Micro Pipeline', title: 'OSINT / Research Automation', mini: 'Sinyal toplama ve sınıflandırma', desc: 'Kaynak toplama, traceability ve sınıflandırma.', bullets: ['source collection'], tags: ['OSINT'], gates: ['source quality'] },
            { id: 'content-auto', type: 'Micro Pipeline', title: 'Content Automation', mini: 'Makale → sosyal post → görsel', desc: 'Çoklu kanal içerik dönüşümü.', bullets: ['repurpose'], tags: ['content'], gates: ['brand consistency'] }
          ]
        },

        {
          id: 'firmware-pcb', type: 'Macro Pipeline', title: 'Firmware / PCB / Embedded Control', mini: 'STM32, ESP32, driver, bench test', desc: 'STM32/ESP32 gömülü yazılım, PCB, HVAC driver, peripheral map ve testbench odaklı aile.', bullets: ['Donanım kısıtları önden okunur', 'Bench test zorunludur'], tags: ['STM32', 'PCB', 'embedded'], gates: ['electrical safety'], children: [
            { id: 'stm32-fw', type: 'Micro Pipeline', title: 'STM32 Firmware', mini: 'Pin map, timing, control logic', desc: 'MCU peripheral allocation ve control logic.', bullets: ['pin map', 'ISR/timing'], tags: ['STM32'], gates: ['timing'] },
            { id: 'esp32-iot', type: 'Micro Pipeline', title: 'ESP32 / IoT', mini: 'Connectivity ve OTA', desc: 'Wi-Fi/BLE ve IoT device state.', bullets: ['connectivity', 'OTA'], tags: ['ESP32'], gates: ['connectivity'] },
            { id: 'pcb-design', type: 'Micro Pipeline', title: 'PCB / Schematic', mini: 'Şematik ve layout', desc: 'Şematik, bileşen seçimi ve kart yerleşimi.', bullets: ['schematic', 'layout'], tags: ['PCB'], gates: ['DFM'] },
            { id: 'hvac-driver', type: 'Micro Pipeline', title: 'HVAC Driver Circuits', mini: '220V fan/compressor driver', desc: 'HVAC fan hız kontrolü ve compressor on/off control devreleri.', bullets: ['AC driver', 'isolation'], tags: ['HVAC'], gates: ['safety'] },
            { id: 'proto-bench', type: 'Micro Pipeline', title: 'Bench Test / Validation', mini: 'Prototip tezgah doğrulama', desc: 'Ölçüm, log ve fault case testi.', bullets: ['measurements', 'fault cases'], tags: ['bench'], gates: ['evidence'] }
          ]
        },

        {
          id: 'opto-laser', type: 'Macro Pipeline', title: 'Optomekanik / Lazer Sistemleri', mini: 'DPSS, SHG/THG, Risley, alignment', desc: 'DPSS zinciri, SHG/THG optimizasyonu, QCW diode RFQ, Risley steering ve alignment/tolerance akışları.', bullets: ['Optik-mekanik-termal bütünlük', 'Vendor/spec yönetimi'], tags: ['DPSS', 'SHG', 'Risley'], gates: ['physics consistency'], children: [
            { id: 'dpss-chain', type: 'Micro Pipeline', title: 'DPSS Chain Design', mini: '808 → 1064 → 532 → 355', desc: 'Stage bazlı lazer zinciri tasarımı.', bullets: ['pump', 'gain medium', 'stage transitions'], tags: ['DPSS'], gates: ['conversion logic'] },
            { id: 'shg-thg', type: 'Micro Pipeline', title: 'SHG / THG Optimization', mini: 'Kristal ve verim', desc: 'Pulse width, crystal conditions ve conversion tradeoffs.', bullets: ['crystals', 'efficiency'], tags: ['SHG', 'THG'], gates: ['physics'] },
            { id: 'diode-rfq', type: 'Micro Pipeline', title: 'QCW Diode Stack RFQ', mini: 'Vendor spec paketi', desc: 'RFQ dili, cooling, electrical ve optical spec hazırlığı.', bullets: ['vendor packet'], tags: ['RFQ'], gates: ['spec completeness'] },
            { id: 'risley', type: 'Micro Pipeline', title: 'Risley / Wedge Steering', mini: 'Prism pair beam steering', desc: 'Prism geometry, motors, encoder ve steering logic.', bullets: ['prisms', 'motors'], tags: ['Risley'], gates: ['steering range'] },
            { id: 'alignment', type: 'Micro Pipeline', title: 'Zoom / Alignment / Tolerance', mini: 'Uzun menzil hizalama', desc: 'Lens centering, vignetting, carriage ve harsh-environment toleransları.', bullets: ['centering', 'mounting'], tags: ['alignment'], gates: ['range fit'] }
          ]
        },

        {
          id: 'hvac-energy', type: 'Macro Pipeline', title: 'HVAC / Enerji Sistemleri', mini: 'EEV, R290, sand battery, parabolic solar, AMR', desc: 'Isıl ve enerji sistemleri ailesi; EEV, R290 cycle, sand battery, solar collector ve AMR içerir.', bullets: ['Thermal/flow systems', 'Component + system level'], tags: ['HVAC', 'energy', 'thermal'], gates: ['thermodynamics'], children: [
            { id: 'eev', type: 'Micro Pipeline', title: 'Electronic Expansion Valve', mini: 'Sizing ve mekanizma', desc: 'Matematiksel ve mekanik EEV tasarımı.', bullets: ['sizing', 'mechanism'], tags: ['EEV'], gates: ['capacity fit'] },
            { id: 'r290-cycle', type: 'Micro Pipeline', title: 'R290 12000 BTU Cycle', mini: 'Residential refrigeration loop', desc: 'Evaporator/condenser ve cycle assumptions.', bullets: ['cycle', 'HX surfaces'], tags: ['R290'], gates: ['cycle coherence'] },
            { id: 'sand-battery', type: 'Micro Pipeline', title: 'Sand Battery', mini: 'Depolama sizing akışı', desc: 'Building inputs ve required sand mass.', bullets: ['inputs', 'storage'], tags: ['sand battery'], gates: ['input completeness'] },
            { id: 'parabolic', type: 'Micro Pipeline', title: 'Parabolic Solar Collector', mini: 'Trough reflector akışı', desc: 'Collector geometry, tracking ve boiler storage.', bullets: ['collector', 'tracking'], tags: ['solar'], gates: ['winter fit'] },
            { id: 'amr', type: 'Micro Pipeline', title: 'AMR Magnetic Refrigeration', mini: 'Magnetocaloric cycle', desc: 'Halbach array, fluid ve cycle frequency.', bullets: ['magnet field', 'AMR cycle'], tags: ['AMR'], gates: ['plausibility'] },
            { id: 'cascade-thermal', type: 'Micro Pipeline', title: 'Cascade Thermal System', mini: 'Solar + well-water hybrid', desc: 'Seasonal solenoid-switched thermal architecture.', bullets: ['mode switching'], tags: ['cascade'], gates: ['mode integrity'] }
          ]
        },

        {
          id: 'water-treatment', type: 'Macro Pipeline', title: 'Su Arıtma / Bor Arıtma', mini: 'RO, bor filter, recirculation, pH', desc: 'Daire girişi kompakt arıtma, RO, bor selective filter, tank recirculation ve pH yönetimi.', bullets: ['Akış sırası kritik', 'Kimya + mekanik birlikte düşünülür'], tags: ['RO', 'bor', 'water'], gates: ['drinking safety'], children: [
            { id: 'pretreatment', type: 'Micro Pipeline', title: 'Pretreatment', mini: 'Sediment / carbon / resin ön arıtma', desc: 'Giriş suyu karakterine göre ön arıtma dizilimi.', bullets: ['sediment', 'carbon'], tags: ['pretreatment'], gates: ['sequence fit'] },
            { id: 'ro-core', type: 'Micro Pipeline', title: 'RO Core', mini: 'Membrane ana akışı', desc: 'RO membrane, permeat/brine ve operating pressure.', bullets: ['membrane', 'pressure'], tags: ['RO'], gates: ['pressure'] },
            { id: 'bor-filter', type: 'Micro Pipeline', title: 'Bor Selective Filter', mini: 'Bor azaltma topolojisi', desc: 'Tank öncesi/sonrası ve recirculation yerleşimleri.', bullets: ['placement'], tags: ['bor'], gates: ['contact time'] },
            { id: 'recirc', type: 'Micro Pipeline', title: 'Tank Recirculation', mini: 'Sürekli devir-daim', desc: 'Tank sonrası selective polishing loop.', bullets: ['loop design'], tags: ['recirculation'], gates: ['usability'] },
            { id: 'ph', type: 'Micro Pipeline', title: 'pH / Remineralization', mini: 'İçme suyu dengeleme', desc: 'pH yükseltme ve gerekirse tad/mineral dengesini düzenleme.', bullets: ['pH', 'balance'], tags: ['pH'], gates: ['drinking suitability'] },
            { id: 'bom-cost', type: 'Micro Pipeline', title: 'BOM / Costing', mini: 'Komponent maliyeti ve layout', desc: 'Fiyat araştırması ve yerleşim.', bullets: ['BOM', 'layout'], tags: ['cost'], gates: ['budget fit'] }
          ]
        },

        {
          id: 'product-mech', type: 'Macro Pipeline', title: 'Ürün / Mekanik Tasarım', mini: 'CAD, STEP, DFM/DFA, serviceability', desc: 'Mekanik ürün tasarımı; CAD/STEP, DFM/DFA, servis, bağlantı ve vertical farming tower gibi sistemleri kapsar.', bullets: ['Function → mechanism', 'Service + manufacturing odaklı'], tags: ['CAD', 'mechanical'], gates: ['manufacturability'], children: [
            { id: 'cad-step', type: 'Micro Pipeline', title: 'CAD / STEP', mini: '3D model ve montaj', desc: 'Parça/assembly modelleme.', bullets: ['3D model'], tags: ['CAD'], gates: ['geometry'] },
            { id: 'dfm-dfa', type: 'Micro Pipeline', title: 'DFM / DFA', mini: 'Üretim ve montaj', desc: 'Tolerans, part count ve assembly stratejisi.', bullets: ['tolerance', 'assembly'], tags: ['DFM'], gates: ['production fit'] },
            { id: 'service-design', type: 'Micro Pipeline', title: 'Serviceability', mini: 'Sök-tak ve bakım erişimi', desc: 'Kolay servis için mekanik çözüm akışı.', bullets: ['maintenance access'], tags: ['service'], gates: ['easy service'] },
            { id: 'vertical-farm', type: 'Micro Pipeline', title: 'Vertical Farming Tower', mini: 'PETG modüler kule', desc: '3D printable irrigation channel’lı kule.', bullets: ['PETG', 'irrigation'], tags: ['vertical farming'], gates: ['printability'] }
          ]
        },

        {
          id: 'agri-landscape', type: 'Macro Pipeline', title: 'Tarım / Peyzaj / Dikey Tarım', mini: 'Ağaç yerleşimi, tür seçimi, sulama', desc: 'Ağaç dizilimi, tür seçimi ve dikey tarım benzeri biyolojik-mekanik akışlar.', bullets: ['Yerleşim şeması', 'Bakım erişimi'], tags: ['landscape', 'trees'], gates: ['growth suitability'], children: [
            { id: 'tree-layout', type: 'Micro Pipeline', title: 'Ağaç Yerleşimi', mini: 'Aks üzerinde dizilim', desc: 'Çınar/ıhlamur gölgesi ve meyve ağaç dizilimi.', bullets: ['axis planning'], tags: ['layout'], gates: ['spacing'] },
            { id: 'species-selection', type: 'Micro Pipeline', title: 'Tür Seçimi', mini: 'Kısıt bazlı tür filtreleme', desc: 'İstenmeyen türleri eleyerek uygun liste üretir.', bullets: ['filter list'], tags: ['species'], gates: ['constraint fit'] },
            { id: 'irrigation-agri', type: 'Micro Pipeline', title: 'Sulama / Bakım', mini: 'Temel yaşam döngüsü desteği', desc: 'Sulama ve bakım erişimi planı.', bullets: ['maintenance'], tags: ['irrigation'], gates: ['maintainability'] }
          ]
        },

        {
          id: 'market-intel', type: 'Macro Pipeline', title: 'Yatırım / Market Intelligence', mini: 'BIST, KAP, makro ve risk sinyalleri', desc: 'Likidite filtreleme, KAP tarama, makro/politik/şirket haberleri ve risk kayıtları.', bullets: ['Havuz oluşturma', 'KAP tarama', 'Risk günlüğü'], tags: ['BIST', 'KAP', 'macro'], gates: ['source freshness'], children: [
            { id: 'universe', type: 'Micro Pipeline', title: 'Evren / Havuz Oluşturma', mini: 'Likidite temelli filtre', desc: 'Takip evreni çıkarır.', bullets: ['screening'], tags: ['universe'], gates: ['liquidity'] },
            { id: 'kap', type: 'Micro Pipeline', title: 'KAP Scanner', mini: 'Duyuru/sinyal tarama', desc: 'Duyurulardan sinyal çıkarır.', bullets: ['announcements'], tags: ['KAP'], gates: ['freshness'] },
            { id: 'macro-news', type: 'Micro Pipeline', title: 'Makro / Haber İzleme', mini: 'Makro, politik, global sinyal', desc: 'Makro ve haber akışını sınıflandırır.', bullets: ['macro', 'news'], tags: ['news'], gates: ['source quality'] },
            { id: 'risk-log', type: 'Micro Pipeline', title: 'Risk Log', mini: 'Varsayım ve risk günlüğü', desc: 'Belirsizlikleri ayrı takip eder.', bullets: ['risk tracking'], tags: ['risk'], gates: ['clarity'] }
          ]
        },

        {
          id: 'content-growth', type: 'Macro Pipeline', title: 'İçerik / Growth / Pazarlama Otomasyonu', mini: 'Makale, sosyal medya, görsel, KDP', desc: 'WordPress, sosyal medya, Canva/AI görsel, LinkedIn ve KDP içerik akışları.', bullets: ['Repurpose', 'Multi-channel', 'Personal brand'], tags: ['content', 'growth'], gates: ['brand consistency'], children: [
            { id: 'article-flow', type: 'Micro Pipeline', title: 'Makale Üretimi', mini: 'WordPress / long-form', desc: 'Makale, görsel, SEO/meta ve yayın.', bullets: ['draft', 'publish'], tags: ['article'], gates: ['clarity'] },
            { id: 'social-flow', type: 'Micro Pipeline', title: 'Sosyal Post Dönüşümü', mini: 'Platform bazlı uyarlama', desc: 'X/IG/FB/Pinterest/LinkedIn uyarlaması.', bullets: ['platform fit'], tags: ['social'], gates: ['fit'] },
            { id: 'personal-brand', type: 'Micro Pipeline', title: 'Personal Brand', mini: 'LinkedIn ağırlıklı içerik', desc: 'Düşünce liderliği ve kişisel marka akışı.', bullets: ['voice', 'positioning'], tags: ['brand'], gates: ['consistency'] },
            { id: 'kdp', type: 'Micro Pipeline', title: 'KDP / Book Factory', mini: 'Kitaplaştırma ve yayın', desc: 'Niş, chaptering ve PDF/upload akışı.', bullets: ['book pipeline'], tags: ['KDP'], gates: ['market fit'] }
          ]
        },

        {
          id: 'health-bio', type: 'Macro Pipeline', title: 'Health / Bio Product Research', mini: 'Hair serum, katalaz, ürün kanıtı', desc: 'Aktif içerik, ürün araştırması ve bilimsel kanıt seviyesi değerlendirmesi.', bullets: ['Claim vs evidence ayrımı', 'Market + paper taraması'], tags: ['bio', 'health'], gates: ['evidence level'], children: [
            { id: 'ingredient-analysis', type: 'Micro Pipeline', title: 'Ingredient Analysis', mini: 'İçerik analizi', desc: 'Formülasyon ve aktif rolü analizi.', bullets: ['INCI', 'active role'], tags: ['ingredients'], gates: ['claim fit'] },
            { id: 'evidence-check', type: 'Micro Pipeline', title: 'Evidence Check', mini: 'Bilimsel çalışma taraması', desc: 'Ürün veya aktif için çalışma/kanıt seviyesi.', bullets: ['papers'], tags: ['evidence'], gates: ['source quality'] },
            { id: 'product-scan', type: 'Micro Pipeline', title: 'Product Scan', mini: 'Türkiye pazar taraması', desc: 'Bulunabilir ürün seçenekleri ve karşılaştırma.', bullets: ['availability'], tags: ['products'], gates: ['availability'] }
          ]
        }
      ]
    },

    {
      id: 'profile-families', type: 'Architecture', title: 'Profile Families', mini: 'Takım profil aileleri', desc: 'Team Compiler tarafından seçilen yüksek seviye rol aileleri.', bullets: ['Önce aile, sonra domain/platform, sonra stack', 'Rol sınırları net tutulur'], tags: ['profiles'], gates: ['role clarity'], children: [
        { id: 'product-family', type: 'Profile Family', title: 'Strategy & Product', mini: 'Product, roadmap, scope', desc: 'Ürün yönü, requirement ve kapsam yönetimi.', bullets: ['product strategy', 'scope guard'], tags: ['product'], gates: ['scope clarity'] },
        { id: 'research-family', type: 'Profile Family', title: 'Research & Intelligence', mini: 'Technical, academic, vendor, regulation', desc: 'Araştırma ve benchmark aileleri.', bullets: ['research', 'benchmarks'], tags: ['research'], gates: ['source quality'] },
        { id: 'arch-family', type: 'Profile Family', title: 'Architecture & System Design', mini: 'System, software, data, security', desc: 'Sistem sınırı ve kontrat oluşturan roller.', bullets: ['boundaries', 'interfaces'], tags: ['architecture'], gates: ['coherence'] },
        { id: 'software-family', type: 'Profile Family', title: 'Software Engineering', mini: 'Frontend, backend, mobile, DB, QA', desc: 'Uygulama ve entegrasyon ailesi.', bullets: ['implementation'], tags: ['software'], gates: ['delivery quality'] },
        { id: 'embedded-family', type: 'Profile Family', title: 'Hardware / Embedded / Firmware', mini: 'Firmware, drivers, RTOS, testbench', desc: 'Gömülü ve donanım-yazılım kesişimi.', bullets: ['drivers', 'bench'], tags: ['embedded'], gates: ['safety'] },
        { id: 'ai-family', type: 'Profile Family', title: 'AI / Agent / Automation', mini: 'LLM app, tool design, eval, context', desc: 'AI ürünleri ve agentik sistemler.', bullets: ['eval', 'tool design'], tags: ['AI'], gates: ['grounding'] },
        { id: 'data-family', type: 'Profile Family', title: 'Data / Analytics', mini: 'ETL, metrics, BI, eval data', desc: 'Veri akışları ve analiz aileleri.', bullets: ['metrics'], tags: ['data'], gates: ['integrity'] },
        { id: 'security-family', type: 'Profile Family', title: 'Security / Privacy / Trust', mini: 'Threat model, permission, privacy', desc: 'Güvenlik ve trust yönetişimi.', bullets: ['tool trust', 'privacy'], tags: ['security'], gates: ['policy'] },
        { id: 'qa-family', type: 'Profile Family', title: 'QA / Verification / Review', mini: 'Spec reviewer, ultrareview, fuzz', desc: 'Doğrulama ve review aileleri.', bullets: ['review', 'edge cases'], tags: ['QA'], gates: ['independence'] },
        { id: 'devops-family', type: 'Profile Family', title: 'DevOps / Platform / Release', mini: 'CI/CD, infra, deploy, rollback', desc: 'Platform ve release ailesi.', bullets: ['deploy', 'observe'], tags: ['DevOps'], gates: ['release safety'] },
        { id: 'memory-family', type: 'Profile Family', title: 'Documentation / Knowledge / Memory', mini: 'Writer, changelog, memory curator', desc: 'Kalıcı bilgi ve yazım odaklı aile.', bullets: ['docs', 'memory'], tags: ['memory'], gates: ['traceability'] },
        { id: 'ux-family', type: 'Profile Family', title: 'UX / UI / Design', mini: 'UX research, flow, design system', desc: 'Arayüz ve kullanıcı deneyimi aileleri.', bullets: ['UX', 'A11y'], tags: ['UX'], gates: ['user clarity'] }
      ]
    },

    {
      id: 'core-layers', type: 'Architecture', title: 'Core Layers', mini: 'Skill / Tool / Plugin / Agent / Context / Memory / Quality', desc: 'Sistemin çalıştırılabilir capability katmanları.', bullets: ['Skill ≠ Tool ≠ Plugin ≠ Agent', 'Memory ve context ayrı tutulur'], tags: ['layers'], gates: ['layer separation'], children: [
        {
          id: 'agent-layer', type: 'Layer', title: 'Agent Profile Layer', mini: 'Mission, inputs, outputs, tool scope', desc: 'Her agent; mission, does/does-not, inputs, outputs, allowed tools, memory/context policy ve failure mode ile tanımlanır.', bullets: ['bounded agency', 'clear IO contract'], tags: ['agents', 'contracts'], gates: ['tool scope']
        },
        {
          id: 'skill-layer', type: 'Layer', title: 'Skill Layer', mini: 'Davranış ve metodoloji', desc: 'Modelin nasıl davranacağını belirleyen reusable çalışma disiplinleri.', bullets: ['planning', 'execution', 'review', 'verification'], tags: ['skills'], gates: ['activation quality'], children: [
            { id: 'planning-gate', type: 'Skill', title: 'planning-gate', mini: 'Research / security / UI / AI gate', desc: 'Planlama öncesi gerekli kapıları kontrol eder.', bullets: ['research?', 'security?', 'UI?'], tags: ['plan'], gates: ['gate completeness'] },
            { id: 'execution-pipeline', type: 'Skill', title: 'execution-pipeline', mini: 'Plan → execute → review', desc: 'İşi task’lara bölüp yürütme protokolü.', bullets: ['task packets'], tags: ['execution'], gates: ['handoff integrity'] },
            { id: 'frontend-quality-gate', type: 'Skill', title: 'frontend-quality-gate', mini: 'UI özel kalite', desc: 'Responsive, UI state ve accessibility kontrol eder.', bullets: ['responsive', 'A11y'], tags: ['frontend'], gates: ['UI quality'] },
            { id: 'spec-skill', type: 'Skill', title: 'spec-compliance-review', mini: 'İstenen şey yapıldı mı?', desc: 'Gereksinim uyumunu kontrol eder.', bullets: ['missing?', 'extra?'], tags: ['review'], gates: ['spec fit'] },
            { id: 'quality-skill', type: 'Skill', title: 'code-quality-review', mini: 'Yapılan şey iyi mi?', desc: 'Temizlik, sürdürülebilirlik ve güvenlik kalitesi.', bullets: ['quality'], tags: ['quality'], gates: ['quality fit'] },
            { id: 'verification-loop', type: 'Skill', title: 'verification-loop', mini: 'TDD ve test kanıtı', desc: 'Failing test, pass proof ve regression loop.', bullets: ['RED/GREEN'], tags: ['verification'], gates: ['evidence'] },
            { id: 'context-budget-manager', type: 'Skill', title: 'context-budget-manager', mini: 'Context rot ve budget', desc: 'Büyük çıktıları özetler, budget’i yönetir.', bullets: ['summaries', 'handoff'], tags: ['context'], gates: ['budget'] },
            { id: 'memory-curator', type: 'Skill', title: 'memory-curator', mini: 'Kalıcı hafıza triage', desc: 'Ne kaydedilir/ne kaydedilmez sorusunu yönetir.', bullets: ['classify', 'freshness'], tags: ['memory'], gates: ['memory hygiene'] },
            { id: 'review-skill', type: 'Skill', title: 'review', mini: 'Hızlı review modu', desc: 'Orta ağırlıkta hızlı inceleme.', bullets: ['quick pass'], tags: ['review'], gates: ['fast check'] },
            { id: 'ultrareview-skill', type: 'Skill', title: 'ultrareview', mini: 'Derin doğrulamalı review', desc: 'Kritik işler için daha derin review.', bullets: ['deep checks'], tags: ['ultrareview'], gates: ['independent verification'] }
          ]
        },
        {
          id: 'tool-layer', type: 'Layer', title: 'Tool Layer', mini: 'CLI ve yardımcı araçlar', desc: 'Modelin/ajanların kullanacağı işlevsel araçlar.', bullets: ['skillctl ana CLI', 'memory/context yardımcı araçları'], tags: ['tools'], gates: ['tool trust'], children: [
            {
              id: 'skillctl', type: 'Tool', title: 'skillctl', mini: 'Ana yönetim CLI’ı', desc: 'Init, lint, audit, test, doctor ve index komutlarını içerir.', bullets: ['init', 'lint', 'audit', 'test', 'doctor', 'index'], tags: ['CLI'], gates: ['tool integrity'], children: [
                { id: 'lint', type: 'Tool', title: 'skillctl lint', mini: 'Format ve kalite denetimi', desc: 'Skill/pipeline yapı kalitesini tarar.', bullets: ['format', 'length', 'overlap'], tags: ['lint'], gates: ['spec'] },
                { id: 'audit', type: 'Tool', title: 'skillctl audit', mini: 'Coverage ve gap taraması', desc: 'Eksik veya çakışan alanları bulur.', bullets: ['coverage', 'duplicates'], tags: ['audit'], gates: ['coverage'] },
                { id: 'test', type: 'Tool', title: 'skillctl test', mini: 'Activation / eval testleri', desc: 'Skill tetikleme ve davranış testleri.', bullets: ['activation tests'], tags: ['test'], gates: ['pass rate'] },
                { id: 'doctor', type: 'Tool', title: 'skillctl doctor', mini: 'Sağlık kontrolü', desc: 'Memory/context/index sağlık kontrolleri.', bullets: ['health checks'], tags: ['doctor'], gates: ['system health'] },
                { id: 'index-cmd', type: 'Tool', title: 'skillctl index', mini: 'Katalog yenileme', desc: 'Skill ve pipeline kataloglarını günceller.', bullets: ['index refresh'], tags: ['index'], gates: ['freshness'] }
              ]
            },
            { id: 'memory-tools', type: 'Tool', title: 'Memory Search Tools', mini: 'search → timeline → detail', desc: 'Hafızayı token-verimli çağırma araçları.', bullets: ['search', 'timeline', 'detail'], tags: ['memory search'], gates: ['efficiency'] },
            { id: 'context-tools', type: 'Tool', title: 'Context Support Tools', mini: 'Summary/index/budget helpers', desc: 'Context budget ve output yönetimi araçları.', bullets: ['summarizer', 'budget estimator'], tags: ['context tools'], gates: ['output filtering'] }
          ]
        },
        {
          id: 'plugin-layer', type: 'Layer', title: 'Plugin / Runtime Adapter Layer', mini: 'Çalışma ortamı adaptörleri', desc: 'Farklı runtime’lara bağlanan adaptör katmanı.', bullets: ['Runtime abstraction', 'Permission mapping'], tags: ['plugins', 'runtime'], gates: ['runtime fit'], children: [
            { id: 'claude-code', type: 'Runtime', title: 'Claude Code', mini: 'Hook/adaptor', desc: 'Claude Code için entegrasyon katmanı.', bullets: ['hooks'], tags: ['Claude Code'], gates: ['fit'] },
            { id: 'codex', type: 'Runtime', title: 'Codex', mini: 'CLI adapter', desc: 'Codex için adaptör.', bullets: ['CLI integration'], tags: ['Codex'], gates: ['fit'] },
            { id: 'cursor', type: 'Runtime', title: 'Cursor', mini: 'IDE adapter', desc: 'Cursor benzeri IDE adaptörü.', bullets: ['IDE'], tags: ['Cursor'], gates: ['fit'] },
            { id: 'opencode', type: 'Runtime', title: 'OpenCode', mini: 'Local AI runtime', desc: 'OpenCode/local runtime adaptörü.', bullets: ['local runtime'], tags: ['OpenCode'], gates: ['fit'] },
            { id: 'gemini', type: 'Runtime', title: 'Gemini CLI', mini: 'CLI adapter', desc: 'Gemini CLI için adaptör.', bullets: ['CLI'], tags: ['Gemini'], gates: ['fit'] },
            { id: 'local-cli', type: 'Runtime', title: 'Local-first CLI', mini: 'İlk MVP zemini', desc: 'En sade çalışma modu.', bullets: ['simple local use'], tags: ['local'], gates: ['simplicity'] }
          ]
        },
        {
          id: 'context-layer', type: 'Layer', title: 'Context Layer', mini: 'Geçici çalışma alanı', desc: 'Working set, tool-output cache, summary/index ve session handoff mekanizmaları.', bullets: ['Context ≠ Memory', 'Büyük çıktı özetlenir'], tags: ['context'], gates: ['budget'], children: [
            { id: 'working-set', type: 'Memory/Context', title: 'Working Set', mini: 'Aktif iş bağlamı', desc: 'Şu anki işin anlık context’i.', bullets: ['current task'], tags: ['working set'], gates: ['scope'] },
            { id: 'tool-cache', type: 'Memory/Context', title: 'Tool Output Cache', mini: 'Ham çıktı tamponu', desc: 'Büyük araç çıktılarının geçici tutulduğu katman.', bullets: ['raw outputs'], tags: ['cache'], gates: ['size control'] },
            { id: 'summary-index', type: 'Memory/Context', title: 'Summary / Index', mini: 'Hafif özet katmanı', desc: 'Aranabilir özet ve indeksler.', bullets: ['searchable summaries'], tags: ['index'], gates: ['retrievability'] },
            { id: 'budget-warning', type: 'Memory/Context', title: 'Budget Warnings', mini: 'Context tüketim uyarıları', desc: 'Context aşımını önler.', bullets: ['alerts'], tags: ['budget'], gates: ['avoid overflow'] },
            { id: 'session-handoff', type: 'Memory/Context', title: 'Session Handoff', mini: 'Kaldığı yerden devam özeti', desc: 'Sonraki oturuma kısa devam özeti bırakır.', bullets: ['next steps'], tags: ['handoff'], gates: ['continuity'] }
          ]
        },
        {
          id: 'memory-layer', type: 'Layer', title: 'Memory Layer', mini: 'Kalıcı karar / tercih / kısıt / ders deposu', desc: 'Decisions, preferences, constraints, lessons ve deprecated paths burada tutulur.', bullets: ['Durable knowledge only', 'Conflict/freshness check'], tags: ['memory'], gates: ['privacy'], children: [
            { id: 'decisions', type: 'Memory/Context', title: 'Decisions', mini: 'Kalıcı kararlar', desc: 'Mimari ve ürün kararları.', bullets: ['architecture decisions'], tags: ['decisions'], gates: ['durability'] },
            { id: 'preferences', type: 'Memory/Context', title: 'Preferences', mini: 'Kullanıcı tercihleri', desc: 'Format/stil tercihlerinin kalıcı kaydı.', bullets: ['preferences'], tags: ['preferences'], gates: ['relevance'] },
            { id: 'constraints', type: 'Memory/Context', title: 'Constraints', mini: 'Kısıtlar', desc: 'Bütçe/teknik/operasyonel sınırlar.', bullets: ['limits'], tags: ['constraints'], gates: ['applicability'] },
            { id: 'lessons', type: 'Memory/Context', title: 'Lessons Learned', mini: 'Öğrenilen dersler', desc: 'Tekrarlanan sorun ve çözümler.', bullets: ['lessons'], tags: ['lessons'], gates: ['usefulness'] },
            { id: 'deprecated', type: 'Memory/Context', title: 'Deprecated Paths', mini: 'Artık kullanılmayan yollar', desc: 'İptal edilen yaklaşımlar.', bullets: ['deprecated'], tags: ['deprecated'], gates: ['clarity'] },
            { id: 'private-exclusion', type: 'Memory/Context', title: 'Private Exclusion', mini: 'Kaydedilmeyecek hassas bilgi', desc: 'Kalıcı hafızadan hariç tutulacak alanlar.', bullets: ['do-not-store'], tags: ['privacy'], gates: ['do not store'] }
          ]
        },
        {
          id: 'quality-layer', type: 'Layer', title: 'Quality / Governance Layer', mini: 'Review, trust, release ve closure', desc: 'Spec compliance, code quality, security, performance, release ve memory/ADR kapanışı.', bullets: ['Doğruluk → kalite → güvenlik → release → memory kapanışı'], tags: ['quality', 'governance'], gates: ['critical issue block'], children: [
            { id: 'spec-gate', type: 'Gate', title: 'Spec Compliance Gate', mini: 'İstenen şey yapıldı mı?', desc: 'Requirement ve çıktı uyumu.', bullets: ['underbuild?', 'overbuild?'], tags: ['spec'], gates: ['must pass'] },
            { id: 'quality-gate', type: 'Gate', title: 'Code / Artifact Quality Gate', mini: 'Yapılan şey iyi mi?', desc: 'Kalite ve sürdürülebilirlik kapısı.', bullets: ['maintainability'], tags: ['quality'], gates: ['must pass'] },
            { id: 'security-gate', type: 'Gate', title: 'Security / Trust Gate', mini: 'Prompt injection, tool trust, permission', desc: 'Güvenlik ve trust kontrolleri.', bullets: ['permissions', 'tool trust'], tags: ['security'], gates: ['must pass'] },
            { id: 'perf-gate', type: 'Gate', title: 'Performance Gate', mini: 'Performans yeterli mi?', desc: 'Latency/load hedefleri.', bullets: ['perf targets'], tags: ['performance'], gates: ['if relevant'] },
            { id: 'release-gate', type: 'Gate', title: 'Release Gate', mini: 'Teslim / deploy güvenliği', desc: 'Deploy, rollback ve release readiness.', bullets: ['rollback'], tags: ['release'], gates: ['must pass'] },
            { id: 'memory-gate', type: 'Gate', title: 'Memory / ADR Gate', mini: 'Ders ve karar kapanışı', desc: 'Decision log ve memory update.', bullets: ['closure'], tags: ['memory', 'ADR'], gates: ['closure'] }
          ]
        }
      ]
    },

    {
      id: 'universal-flow', type: 'Architecture', title: 'Universal Execution Flow', mini: 'Yaygın üst seviye akış', desc: 'Çoğu iş için geçerli yüksek seviyeli aşama dizisi.', bullets: ['Intake', 'Clarify', 'Architecture', 'Plan', 'Implement', 'Integrate', 'Review', 'Verify', 'Release', 'Memory Update'], tags: ['flow'], gates: ['stage discipline'], children: [
        { id: 'flow-intake', type: 'Stage', title: 'Intake / Clarify', mini: 'İhtiyaç ve kapsamı netleştir', desc: 'Talep, başarı kriteri ve kısıtlar netleşir.', bullets: ['brief', 'constraints'], tags: ['intake'], gates: ['clarity'] },
        { id: 'flow-arch', type: 'Stage', title: 'Architecture / Plan', mini: 'Sistem ve uygulanabilir plan', desc: 'Sınırlar, modüller ve plan oluşturulur.', bullets: ['architecture', 'plan'], tags: ['architecture'], gates: ['plan quality'] },
        { id: 'flow-impl', type: 'Stage', title: 'Implement / Integrate', mini: 'Uygula ve birleştir', desc: 'Parçalar üretilip birleştirilir.', bullets: ['implementation', 'integration'], tags: ['implementation'], gates: ['integration'] },
        { id: 'flow-review', type: 'Stage', title: 'Review / Verify', mini: 'İncele ve doğrula', desc: 'Review, test ve doğrulama aşaması.', bullets: ['review', 'test'], tags: ['review'], gates: ['evidence'] },
        { id: 'flow-release', type: 'Stage', title: 'Release / Memory Update', mini: 'Teslim ve öğrenim kapanışı', desc: 'Teslim edilir, kararlar ve dersler kayda geçer.', bullets: ['release', 'memory'], tags: ['release'], gates: ['closure'] }
      ]
    }
  ]
};
