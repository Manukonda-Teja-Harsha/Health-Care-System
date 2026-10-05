import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { ArrowRight, ChevronDown, Activity, Heart, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Home() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    { q: "How do I book an appointment?", a: "You can book directly from your patient dashboard after creating an account." },
    { q: "Can I access my medical records?", a: "Yes, all your historical records and lab reports are available securely." },
    { q: "Can I manage prescriptions?", a: "Active prescriptions can be viewed and managed digitally." },
    { q: "Can doctors manage patient information?", a: "Doctors have a dedicated portal to manage clinical workflows." }
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-6 md:px-12 lg:px-24 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl z-10"
        >
          <h1 className="text-6xl md:text-8xl lg:text-[11rem] font-display font-medium leading-[0.85] tracking-oversized mb-10 text-balance">
            Healthcare,<br />
            <span className="text-muted-foreground">designed</span> around you.
          </h1>
          
          <div className="flex flex-col md:flex-row gap-8 md:items-end justify-between max-w-3xl">
            <p className="text-lg md:text-xl text-muted-foreground max-w-md font-sans leading-relaxed">
              Connect appointments, doctors, prescriptions, health records and everyday health information in one digital healthcare experience.
            </p>
            <div className="flex gap-4">
              <Link to="/register"><Button size="lg" className="rounded-full">Book an Appointment</Button></Link>
              <Button size="lg" variant="outline" className="rounded-full">Explore Healthcare</Button>
            </div>
          </div>
        </motion.div>

        {/* Abstract floating elements in background */}
        <motion.div style={{ y }} className="absolute right-[5%] top-[15%] w-72 h-96 bg-card border border-border shadow-2xl rounded-3xl p-6 hidden lg:flex flex-col justify-between transform rotate-6 opacity-80 backdrop-blur-sm z-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent"><Heart /></div>
            <div>
              <div className="text-sm text-muted-foreground">Heart Rate</div>
              <div className="text-xl font-medium">72 BPM</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-2 bg-muted rounded-full w-full"></div>
            <div className="h-2 bg-muted rounded-full w-4/5"></div>
            <div className="h-2 bg-muted rounded-full w-3/4"></div>
          </div>
        </motion.div>
      </section>

      {/* Large Typographic Transition / About */}
      <section id="about" className="py-32 overflow-hidden bg-foreground text-background">
        <motion.div 
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="flex whitespace-nowrap"
        >
          {['CARE', 'TRUST', 'HEALTH', 'EXPERIENCE'].map((word, i) => (
            <span key={i} className="text-8xl md:text-[12rem] font-display font-bold px-12 tracking-tighter opacity-80 hover:opacity-100 transition-opacity">
              {word}
            </span>
          ))}
        </motion.div>
      </section>

      {/* Healthcare Experiences / Health */}
      <section id="health" className="py-32 px-6 md:px-12 lg:px-24">
        <h2 className="text-4xl md:text-6xl font-display font-medium tracking-tight mb-20">Healthcare Experiences</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card border border-border rounded-[2rem] p-10 md:p-16 flex flex-col justify-between min-h-[500px] group hover:border-accent transition-colors">
            <div>
              <h3 className="text-3xl font-display mb-4">Patient Care</h3>
              <p className="text-muted-foreground text-lg">Appointments, prescriptions and health records seamlessly integrated.</p>
            </div>
            <div className="mt-12 overflow-hidden rounded-xl border border-border bg-background h-64 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500">
               <Calendar className="w-16 h-16 text-muted-foreground/30" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-[2rem] p-10 md:p-16 flex flex-col justify-between min-h-[500px] md:mt-24 group hover:border-accent transition-colors">
            <div>
              <h3 className="text-3xl font-display mb-4">Health Monitoring</h3>
              <p className="text-muted-foreground text-lg">Heart rate, blood pressure, activity and other health metrics.</p>
            </div>
            <div className="mt-12 overflow-hidden rounded-xl border border-border bg-background h-64 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500">
               <Activity className="w-16 h-16 text-muted-foreground/30" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 px-6 md:px-12 lg:px-24 bg-card border-y border-border" id="services">
        <h2 className="text-4xl md:text-6xl font-display font-medium tracking-tight mb-20">Services</h2>
        <div className="flex flex-col">
          {[
            { id: "01", title: "Find a Doctor", desc: "Discover doctors by specialty." },
            { id: "02", title: "Appointments", desc: "Book and manage appointments." },
            { id: "03", title: "Health Records", desc: "Access medical history and documents." },
            { id: "04", title: "Prescriptions", desc: "Manage active prescriptions and medications." }
          ].map((service) => (
            <div key={service.id} className="group flex flex-col md:flex-row md:items-center justify-between py-10 border-b border-border/50 hover:bg-muted/50 transition-colors px-6 cursor-pointer rounded-2xl">
              <div className="flex items-baseline gap-8">
                <span className="text-sm font-mono text-muted-foreground">{service.id}</span>
                <h3 className="text-4xl font-display font-medium group-hover:translate-x-4 transition-transform duration-300">{service.title}</h3>
              </div>
              <div className="flex items-center gap-8 mt-4 md:mt-0">
                <p className="text-muted-foreground">{service.desc}</p>
                <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
                  <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-32 px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { num: "50K+", label: "Patients supported" },
            { num: "12K+", label: "Appointments completed" },
            { num: "500+", label: "Healthcare professionals" },
            { num: "98%", label: "Digital record availability" }
          ].map((metric, idx) => (
            <div key={idx} className="flex flex-col border-l border-border pl-6">
              <span className="text-5xl md:text-6xl font-display font-medium mb-2">{metric.num}</span>
              <span className="text-muted-foreground">{metric.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-6 md:px-12 lg:px-24 max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-display font-medium tracking-tight mb-16 text-center">Questions?</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-border rounded-2xl bg-card overflow-hidden">
              <button 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-xl font-medium">{faq.q}</span>
                <ChevronDown className={cn("w-6 h-6 transition-transform", openFaq === idx && "rotate-180")} />
              </button>
              {openFaq === idx && (
                <div className="p-6 pt-0 text-muted-foreground text-lg">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6 text-center bg-foreground text-background">
        <h2 className="text-6xl md:text-8xl font-display font-medium tracking-tighter mb-12 max-w-4xl mx-auto leading-tight">
          YOUR HEALTHCARE JOURNEY STARTS HERE.
        </h2>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link to="/register"><Button size="lg" className="rounded-full bg-background text-foreground hover:bg-muted text-lg h-16 px-10">Book an Appointment</Button></Link>
          <Link to="/#services"><Button size="lg" variant="outline" className="rounded-full text-lg h-16 px-10 border-background/20 hover:bg-background/10 text-background hover:text-background">Explore Services</Button></Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 lg:px-24 border-t border-border flex justify-between items-center text-sm text-muted-foreground">
        <div>© 2026 Healthcare Inc. All rights reserved.</div>
        <div className="flex gap-6">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </footer>
    </div>
  );
}
