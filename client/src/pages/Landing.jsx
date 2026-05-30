import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import {
  Activity, Calculator, Dumbbell, BookOpen, Apple,
  ChevronRight, Check, Zap, BarChart2, Globe
} from 'lucide-react';

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all"
    >
      <Globe size={15} />
      {lang === 'en' ? 'عربي' : 'English'}
    </button>
  );
}

export default function Landing() {
  const { t, lang } = useLang();

  const features = [
    { icon: Calculator, title: t('feature1Title'), desc: t('feature1Desc'), color: 'text-green-400', bg: 'bg-green-500/10' },
    { icon: Dumbbell, title: t('feature2Title'), desc: t('feature2Desc'), color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: BookOpen, title: t('feature3Title'), desc: t('feature3Desc'), color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: Apple, title: t('feature4Title'), desc: t('feature4Desc'), color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  const stats = [
    { value: t('stat1'), sub: t('stat1Sub') },
    { value: t('stat2'), sub: t('stat2Sub') },
    { value: t('stat3'), sub: t('stat3Sub') },
    { value: t('stat4'), sub: t('stat4Sub') },
  ];

  const steps = [
    { num: '01', title: t('step1Title'), desc: t('step1Desc') },
    { num: '02', title: t('step2Title'), desc: t('step2Desc') },
    { num: '03', title: t('step3Title'), desc: t('step3Desc') },
  ];

  const heroLines = t('landingHero').split('\n');

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 overflow-x-hidden">
      {/* Navbar */}
      <header className="border-b border-gray-800/50 sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center">
              <Activity size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">{t('appName')}</span>
          </div>
          <div className="flex items-center gap-3">
            <LangToggle />
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
              {t('signIn')}
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">
              {t('startFree')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-8">
            <Zap size={14} />
            {lang === 'ar' ? 'منصة اللياقة الكاملة' : 'The Complete Fitness Platform'}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
            {heroLines.map((line, i) => (
              <React.Fragment key={i}>
                {i === 0 ? <span>{line}</span> : <><br /><span className="text-green-400">{line}</span></>}
              </React.Fragment>
            ))}
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            {t('landingSubtitle')}
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all active:scale-95 shadow-lg shadow-green-500/25">
              {t('startFree')} <ChevronRight size={20} />
            </Link>
            <Link to="/login"
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all">
              {t('signIn')}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-white">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
            {t('featuresTitle')}
          </h2>
          <p className="text-gray-400 text-center mb-14 max-w-xl mx-auto">
            {lang === 'ar'
              ? 'أدوات احترافية مصممة لمساعدتك على تحقيق أهدافك اللياقية بكفاءة.'
              : 'Professional tools designed to help you achieve your fitness goals efficiently.'}
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <div key={i} className="card hover:border-gray-700 transition-all group">
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon size={24} className={color} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6 bg-gray-900/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-14">
            {t('howItWorksTitle')}
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map(({ num, title, desc }, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
                  <span className="text-green-400 font-black text-lg">{num}</span>
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature checklist */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                {lang === 'ar' ? 'كل شيء مجاني، دائماً' : 'Everything free, forever'}
              </h2>
              <p className="text-gray-400 mb-8">
                {lang === 'ar'
                  ? 'لا اشتراكات، لا بطاقة ائتمان، لا قيود. منصة PushLIMITfit متاحة بالكامل مجاناً.'
                  : 'No subscriptions, no credit card, no limits. PushLIMITfit is completely free to use.'}
              </p>
              <ul className="space-y-3">
                {[
                  lang === 'ar' ? 'حاسبة سعرات بمعادلة علمية' : 'Scientific calorie calculator (Mifflin-St Jeor)',
                  lang === 'ar' ? 'تسجيل غير محدود للتمارين' : 'Unlimited workout logging',
                  lang === 'ar' ? '5 برامج تدريب جاهزة' : '5 pre-built training programs',
                  lang === 'ar' ? 'تتبع التغذية اليومية' : 'Daily nutrition tracking',
                  lang === 'ar' ? 'لوحة تحكم وإحصائيات' : 'Dashboard & progress stats',
                  lang === 'ar' ? 'دعم اللغة العربية والإنجليزية' : 'Arabic & English language support',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-green-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Mockup card */}
            <div className="card border-gray-700 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Activity size={16} className="text-white" />
                </div>
                <span className="font-bold text-white">PushLIMITfit</span>
                <div className="ms-auto flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-gray-500">{lang === 'ar' ? 'نشط' : 'Live'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: lang === 'ar' ? 'الهدف اليومي' : 'Daily Goal', value: '2,400 kcal', color: 'text-green-400' },
                  { label: lang === 'ar' ? 'المستهلك' : 'Consumed', value: '1,640 kcal', color: 'text-orange-400' },
                  { label: lang === 'ar' ? 'التمارين' : 'Workouts', value: lang === 'ar' ? '١٢ هذا الشهر' : '12 this month', color: 'text-blue-400' },
                  { label: lang === 'ar' ? 'البروتين' : 'Protein', value: '142g / 180g', color: 'text-purple-400' },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-800/60 rounded-xl p-3">
                    <div className={`text-sm font-bold ${item.color}`}>{item.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{lang === 'ar' ? 'تقدم السعرات' : 'Calorie progress'}</span>
                  <span>68%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full">
                  <div className="h-full w-[68%] bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" />
                </div>
              </div>
              <div className="text-xs text-gray-600 text-center">
                {lang === 'ar' ? '✓ تسجيل اليوم مكتمل' : '✓ Today\'s log complete'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 text-center bg-gradient-to-b from-gray-900/0 to-green-950/20">
        <div className="max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BarChart2 size={28} className="text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('ctaTitle')}</h2>
          <p className="text-gray-400 mb-8">{t('ctaDesc')}</p>
          <Link to="/register"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-10 py-4 rounded-2xl text-lg transition-all active:scale-95 shadow-lg shadow-green-500/25">
            {t('startFree')} <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
              <Activity size={14} className="text-white" />
            </div>
            <span className="font-bold text-white">{t('appName')}</span>
            <span className="text-gray-600 text-sm">— {t('footerTagline')}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link to="/login" className="hover:text-gray-300 transition-colors">{t('signIn')}</Link>
            <Link to="/register" className="hover:text-gray-300 transition-colors">{t('startFree')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
