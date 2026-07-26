export default function HeroPhoto() {
  return (
    <div className="hidden lg:flex justify-end items-end self-end" style={{ marginBottom: "-64px" }}>
      <img
        src="/nextjs-app/chuck-hero.png"
        alt="Chuck Anderson — host of the Limitless Living Show"
        className="object-contain object-bottom"
        style={{ height: "580px", width: "auto" }}
      />
    </div>
  );
}
