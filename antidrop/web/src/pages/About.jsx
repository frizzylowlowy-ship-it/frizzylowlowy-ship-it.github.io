import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Target, Users, School, ShieldCheck, BookOpenCheck, Sparkles, ArrowRight, MapPin } from 'lucide-react';
import PageHead, { SectionTitle, ArtCircle } from '../components/PageHead.jsx';
import { IlloShield } from '../components/Illo.jsx';
import { Reveal, Stagger, Item } from '../components/ui.jsx';

const SOURCES = [
  ['Банк России', 'Каждый пятый выявленный дроппер — несовершеннолетний', 'https://www.cbr.ru/press/regevent/?id=44626'],
  ['МВД России / «Коммерсантъ»', 'Число подростков-дропперов в России выросло в 48 раз за год', 'https://www.kommersant.ru/doc/8972652'],
  ['МВД России / «Коммерсантъ»', '«Синдром пионера»: подростков вербуют от имени полиции', 'https://www.kommersant.ru/doc/8737419'],
  ['Росфинмониторинг', '50–70 % дропперов — моложе 25 лет', 'https://www.fedsfm.ru/releases/10222'],
  ['НАФИ / «Республика»', '70 % молодёжи 14–35 лет сталкивались с предложениями «быстрого заработка»', 'https://respublika11.ru/2026/09/14/v-rossii-usilivayut-meryi-po-finansovoy-bezopasnosti-molodezhi/'],
  ['PrimaMedia', 'Рост IT-преступлений несовершеннолетних в Приморье на 85,6 % за 4 года', 'https://primamedia.ru/news/2501438/'],
  ['КонсультантПлюс', 'С 5 июля 2025 года введена уголовная ответственность для дропперов (ст. 187 УК РФ)', 'https://www.consultant.ru/document/cons_doc_LAW_495016/73fda7f00017176601fac1d3f13cc5dbae00f2d5/'],
  ['КонсультантПлюс', 'Подписан закон об уголовной ответственности для дропперов', 'https://www.consultant.ru/law/hotdocs/89782.html'],
  ['Банк России', 'Что делать, если перевод пришёл или ушёл по ошибке', 'https://www.cbr.ru/Reception/TopicalMessage/Page/9720'],
  ['Банк России', 'Приморский край — столица финансовой культуры 2026 года', 'https://www.cbr.ru/press/event/?id=28380'],
  ['Финансовая культура (fincult.info)', 'Кто такие дропперы, или как не стать соучастником преступления', 'https://fincult.info/article/kto-takie-droppery-ili-kak-ne-stat-souchastnikom-prestupleniya/'],
  ['Онлайн-уроки финансовой грамотности', 'Бесплатные онлайн-уроки для школьников', 'https://dni-fg.ru/'],
];

export default function About() {
  return (
    <div className="page">
      <PageHead eyebrow="О проекте"
        title={<>Школьный проект, который <span className="grad-text">работает как сервис</span></>}
        lead="«Антидроп» сделала команда «Бетонный файрвол» из МБОУ СОШ № 4 г. Большой Камень Приморского края для хакатона «Дроп.Нет». Мы хотели, чтобы о дропперстве говорили на языке подростков — через игры, а не через нотации."
        art={<AboutArt />} />

      <section className="section-sm" style={{ paddingTop: 0 }}>
        <div className="container">
          <Stagger className="grid g-3">
            {[
              [Target, 'Цель', 'Сделать так, чтобы подросток узнал вербовку с первого сообщения и знал, что делать, — до того, как скажет «да».', 'var(--brand)', 'var(--brand-50)'],
              [Users, 'Для кого', 'Ученики 5–11 классов, их родители и учителя: классные руководители, педагоги ОБЗР и обществознания.', '#0A7A57', 'var(--mint-50)'],
              [ShieldCheck, 'Принципы', 'Только проверенные факты с источниками. Никаких запугиваний — только понятные правила и поддержка.', '#C2392A', 'var(--coral-50)'],
            ].map(([I, t, d, c, bg]) => (
              <Item key={t} style={{ display: 'grid', gap: 12, padding: 28, borderRadius: 24, background: 'var(--bg)', alignContent: 'start' }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: bg, color: c, display: 'grid', placeItems: 'center' }}><I /></div>
                <h3 className="h3" style={{ fontSize: 22 }}>{t}</h3>
                <p className="ink2">{d}</p>
              </Item>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section-sm">
        <div className="container split">
          <Reveal>
            <SectionTitle eyebrow="Почему это важно" title="Приморье — регион, где это особенно актуально" />
            <div style={{ display: 'grid', gap: 14 }} className="ink2">
              <p>По данным PrimaMedia, число IT-преступлений, совершённых несовершеннолетними в Приморском крае, за четыре года выросло на 85,6 %. А на 2026 год Приморье выбрано столицей финансовой культуры России (сообщение Банка России).</p>
              <p>Мы живём в Большом Камне и видим, что предложения «лёгкого заработка» приходят нашим знакомым в соцсетях и игровых чатах. Поэтому начали с собственной школы — и сделали материалы, которые может использовать любая другая.</p>
            </div>
          </Reveal>
          <Reveal delay={.1} className="card" style={{ padding: 28, display: 'grid', gap: 18 }}>
            {[
              [School, 'МБОУ СОШ № 4', 'г. Большой Камень, Приморский край'],
              [Users, 'Команда «Бетонный файрвол»', 'Капитан — Артём Крюков'],
              [Sparkles, 'Хакатон «Дроп.Нет»', 'Проект по профилактике вовлечения подростков в дропперство'],
              [MapPin, 'антидроп.рф', 'Бесплатно для школ, учеников и родителей'],
            ].map(([I, t, d]) => (
              <div key={t} className="row" style={{ gap: 14 }}>
                <span className="num-badge" style={{ background: 'var(--sky-50)', color: '#1667B8', width: 44, height: 44 }}><I size={20} /></span>
                <div><b style={{ fontSize: 16.5 }}>{t}</b><div className="muted" style={{ fontSize: 14.5 }}>{d}</div></div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section-sm" id="istochniki" style={{ scrollMarginTop: 80 }}>
        <div className="container">
          <SectionTitle eyebrow="Источники" title="На чём основаны материалы" lead="Все цифры и формулировки на сайте взяты из открытых источников. Если вы нашли неточность — сообщите учителю или администратору сайта." />
          <Stagger className="grid g-2" s={.04} style={{ gap: 12 }}>
            {SOURCES.map(([who, t, href]) => (
              <Item key={href}>
                <a href={href} target="_blank" rel="noopener noreferrer" className="card card-hover row" style={{ padding: '16px 18px', gap: 14, alignItems: 'flex-start', height: '100%' }}>
                  <span style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--bg-2)', display: 'grid', placeItems: 'center', flex: 'none' }}><BookOpenCheck size={18} color="var(--brand)" /></span>
                  <div style={{ flex: 1 }}><div className="muted" style={{ fontSize: 12.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em' }}>{who}</div><div style={{ fontWeight: 700, marginTop: 2 }}>{t}</div></div>
                  <ExternalLink size={16} color="var(--muted)" style={{ flex: 'none', marginTop: 4 }} />
                </a>
              </Item>
            ))}
          </Stagger>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 20, maxWidth: 820 }}>
            Сайт создан в образовательных целях и не является официальным ресурсом Банка России, МВД России или других органов власти. Материалы не заменяют консультацию юриста.
          </p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <Reveal className="card" style={{ padding: '40px 36px', background: '#7B6EF0', color: '#fff', border: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div><h2 className="h2" style={{ color: '#fff', fontSize: 'clamp(26px,3vw,38px)' }}>Хотите провести занятие в своей школе?</h2><p style={{ opacity: .85, marginTop: 8, fontSize: 17 }}>Все материалы бесплатны. Регистрация учителя — минута.</p></div>
            <Link to="/uchitelyam" className="btn btn-white btn-lg">Материалы для учителя <ArrowRight size={20} /></Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function AboutArt() {
  return <ArtCircle size={300}><IlloShield size={230} /></ArtCircle>;
}
