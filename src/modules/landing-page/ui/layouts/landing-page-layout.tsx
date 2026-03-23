
import { LandingPageNavbar } from '../components/landing-page-navbar';
interface LandingPageLayoutProps{
  children: React.ReactNode;
}

export const LandingPageLayout = ({ children }: LandingPageLayoutProps) => {
  return (
      <div className='w-full '>
        <LandingPageNavbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
  )
}


