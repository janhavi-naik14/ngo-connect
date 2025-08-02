// pages/Home.js
export default function Home() {
  return (
    <>
      {/* Image Section */}
      <section className="py-12 px-4 md:px-16 bg-green-900">
        <h2 className="text-3xl font-bold text-center text-lime-200 mb-8">Impact in Action</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <img src="/images/ngo1.jpg" alt="NGO 1" className="rounded-lg shadow-md hover:scale-105 transition" />
          <img src="/images/ngo2.jpg" alt="NGO 2" className="rounded-lg shadow-md hover:scale-105 transition" />
          <img src="/images/ngo3.jpg" alt="NGO 3" className="rounded-lg shadow-md hover:scale-105 transition" />
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-12 bg-green-800">
        <h2 className="text-3xl font-bold text-center text-lime-200 mb-8">What Our Partners Say</h2>
        <div className="flex overflow-x-scroll space-x-6 px-4 md:px-16 scrollbar-hide">
          {[1, 2, 3].map((id) => (
            <div key={id} className="min-w-[300px] bg-green-700 p-6 rounded-lg shadow-md">
              <p className="text-lime-100 italic">“Collaborating on NGO Connect made our campaign reach double the audience!”</p>
              <p className="mt-4 font-semibold text-lime-300">— NGO Partner {id}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 px-4 md:px-16 bg-green-900">
        <h2 className="text-3xl font-bold text-center text-lime-200 mb-6">Contact Us</h2>
        <form className="max-w-xl mx-auto space-y-4">
          <input type="text" placeholder="Your Name" className="w-full px-4 py-2 rounded bg-green-800 text-white placeholder-lime-200" />
          <input type="email" placeholder="Your Email" className="w-full px-4 py-2 rounded bg-green-800 text-white placeholder-lime-200" />
          <textarea rows="4" placeholder="Your Message" className="w-full px-4 py-2 rounded bg-green-800 text-white placeholder-lime-200"></textarea>
          <button type="submit" className="bg-lime-400 text-green-900 px-6 py-2 rounded-full font-bold hover:bg-lime-500">Send Message</button>
        </form>
      </section>
   </>
  );
}
