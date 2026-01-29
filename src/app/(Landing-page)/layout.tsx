import { LandingPageLayout } from '@/modules/landing-page/ui/layouts/landing-page-layout';


interface LayoutProps{
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    
    <LandingPageLayout>
      {children}
    </LandingPageLayout>
  )
};

export default Layout
