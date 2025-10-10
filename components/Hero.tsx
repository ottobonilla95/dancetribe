import Image from "next/image";
import ButtonSignin from "./ButtonSignin";
import { CONTACT } from "@/constants/contact";

const Hero = () => {
  return (
    <section className="text-neutral-content min-h-screen lg:min-h-0 max-w-7xl mx-auto flex flex-col flex-col-reverse lg:flex-row items-center justify-center gap-8 lg:gap-20 px-8 py-8 lg:py-20">
      <div className="flex flex-col gap-6 lg:gap-10 items-center justify-center text-center lg:text-left lg:items-start">
        <div className="flex flex-col gap-4 lg:gap-6 items-center lg:items-start">
          <h1 className="font-extrabold text-3xl lg:text-6xl tracking-tight">
            Connect with dancers worldwide
          </h1>
          <p className="text-lg opacity-80 leading-relaxed hidden lg:block">
            Discover and connect with friends. Find teachers, dance partners, music, cities, and more.
          </p>
        </div>
        <div className="flex flex-col items-center sm:flex-row gap-3 w-full sm:w-auto">
          <ButtonSignin text="🕺 Join DanceTribe 💃" extraStyle="btn-primary btn-wide" />
          {/* <a
            href={`mailto:${CONTACT.COLLABORATION_EMAIL}`}
            className="btn btn-outline btn-wide gap-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            Collab
          </a> */}
        </div>
      </div>
      <div className="lg:w-full">
        <Image
          src="/img/hero/hero.gif"
          alt="Dance around the world"
          className="w-full"
          priority={true}
          width={500}
          height={500}
        />
      </div>
    </section>
  );
};

export default Hero;
