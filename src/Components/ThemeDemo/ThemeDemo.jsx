import React from 'react';

const ThemeDemo = () => {
  return (
    <div className="theme-demo">
      <section className="hero-section" style={{ padding: '2rem' }}>
        <h1>CashHeros Theme Demo</h1>
        <p>This page demonstrates the new color scheme and styling for CashHeros.</p>
        <button className="cta-button">Get Started</button>
      </section>

      <section style={{ padding: '2rem', backgroundColor: 'var(--card-bg)' }}>
        <h2>Color Palette</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ 
            width: '150px', 
            height: '100px', 
            backgroundColor: 'var(--primary-green)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            borderRadius: '8px'
          }}>
            Primary Green
          </div>
          <div style={{ 
            width: '150px', 
            height: '100px', 
            backgroundColor: 'var(--green-hover)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            borderRadius: '8px'
          }}>
            Green Hover
          </div>
          <div style={{ 
            width: '150px', 
            height: '100px', 
            backgroundColor: 'var(--header-footer-bg)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--text-on-header)',
            borderRadius: '8px'
          }}>
            Header/Footer BG
          </div>
          <div style={{ 
            width: '150px', 
            height: '100px', 
            backgroundColor: 'var(--neutral-bg)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--text-main)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            Neutral BG
          </div>
          <div style={{ 
            width: '150px', 
            height: '100px', 
            backgroundColor: 'var(--card-bg)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--text-main)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            Card BG
          </div>
          <div style={{ 
            width: '150px', 
            height: '100px', 
            backgroundColor: 'var(--accent-blue)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            borderRadius: '8px'
          }}>
            Accent Blue
          </div>
          <div style={{ 
            width: '150px', 
            height: '100px', 
            backgroundColor: 'var(--error-red)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            borderRadius: '8px'
          }}>
            Error Red
          </div>
          <div style={{ 
            width: '150px', 
            height: '100px', 
            backgroundColor: 'var(--sale-orange)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            borderRadius: '8px'
          }}>
            Sale Orange
          </div>
        </div>
      </section>

      <section style={{ padding: '2rem' }}>
        <h2>UI Components</h2>
        
        <h3>Buttons</h3>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button className="btn">Primary Button</button>
          <button className="btn secondary">Secondary Button</button>
          <button className="btn success">Success Button</button>
          <button className="btn danger">Danger Button</button>
        </div>

        <h3>Cards</h3>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div className="card" style={{ padding: '1rem', width: '250px' }}>
            <h4>Standard Card</h4>
            <p className="subtext">This is a standard card with some content.</p>
            <button className="btn">Learn More</button>
          </div>
          
          <div className="card" style={{ padding: '1rem', width: '250px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h4>Deal Card</h4>
              <span className="tag tag-trending">Trending</span>
            </div>
            <p className="subtext">Save 20% on your next purchase with this exclusive deal.</p>
            <button className="btn">Get Deal</button>
          </div>
          
          <div className="card" style={{ padding: '1rem', width: '250px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h4>Cashback Offer</h4>
              <span className="tag tag-sale">Sale</span>
            </div>
            <p className="subtext">Earn 5% cashback on all purchases made today.</p>
            <button className="btn">Activate</button>
          </div>
        </div>

        <h3>Tags</h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <span className="tag tag-trending">Trending</span>
          <span className="tag tag-sale">Sale</span>
          <span className="tag tag-info">Info</span>
          <span className="tag tag-new">New</span>
          <span className="tag tag-discount">25% Off</span>
        </div>

        <h3>Form Elements</h3>
        <div style={{ maxWidth: '400px', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Name</label>
            <input type="text" id="name" placeholder="Enter your name" style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Email</label>
            <input type="email" id="email" placeholder="Enter your email" style={{ width: '100%' }} />
          </div>
          <button className="btn">Submit</button>
        </div>
      </section>

      <section className="newsletter-section" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-on-header)' }}>Subscribe to Our Newsletter</h2>
        <p style={{ color: 'var(--text-on-header)', maxWidth: '600px', margin: '0 auto 1rem' }}>
          Stay updated with the latest deals and cashback offers.
        </p>
        <div style={{ display: 'flex', maxWidth: '500px', margin: '0 auto', gap: '0.5rem' }}>
          <input type="email" placeholder="Enter your email" style={{ flex: 1 }} />
          <button className="btn" style={{ backgroundColor: 'white', color: 'var(--primary-green)' }}>Subscribe</button>
        </div>
      </section>

      <section className="blog-section" style={{ padding: '2rem' }}>
        <h2>Blog Section</h2>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <div className="blog-card" style={{ width: '300px', padding: '1rem', borderRadius: '8px', border: '1px solid var(--blog-borders)' }}>
            <span className="blog-tag-featured" style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'inline-block' }}>Featured</span>
            <h3 className="blog-title">How to Maximize Your Cashback</h3>
            <p className="blog-description">Learn the best strategies to get the most out of your cashback rewards.</p>
            <button className="blog-cta">Read More</button>
          </div>
          
          <div className="blog-card" style={{ width: '300px', padding: '1rem', borderRadius: '8px', border: '1px solid var(--blog-borders)' }}>
            <span className="blog-tag-secondary" style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'inline-block' }}>Tips</span>
            <h3 className="blog-title">Top 10 Cashback Sites</h3>
            <p className="blog-description">Discover the best cashback websites to save money on your purchases.</p>
            <button className="blog-cta">Read More</button>
          </div>
          
          <div className="blog-card" style={{ width: '300px', padding: '1rem', borderRadius: '8px', border: '1px solid var(--blog-borders)' }}>
            <span className="blog-tag-secondary" style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'inline-block' }}>Guide</span>
            <h3 className="blog-title">Cashback vs. Rewards Points</h3>
            <p className="blog-description">Which is better? We compare cashback and rewards points programs.</p>
            <button className="blog-cta">Read More</button>
          </div>
        </div>
      </section>

      <footer style={{ padding: '2rem', textAlign: 'center' }}>
        <p>© 2023 CashHeros. All rights reserved.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          <a href="#" style={{ color: 'var(--text-on-header)' }}>Terms</a>
          <a href="#" style={{ color: 'var(--text-on-header)' }}>Privacy</a>
          <a href="#" style={{ color: 'var(--text-on-header)' }}>Contact</a>
        </div>
      </footer>
    </div>
  );
};

// Make sure the component is properly exported
export default ThemeDemo;