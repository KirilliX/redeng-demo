import { useLocation } from "react-router-dom";

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1) || "/";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111214] px-6 text-white">
      <div className="max-w-xl text-center">
        <p className="text-sm tracking-[0.4em] uppercase text-red-500 mb-6">404</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Страница не найдена</h1>
        <p className="text-[#8a8f9a] text-lg leading-relaxed mb-10">
          Адрес <span className="text-white">/{pageName.replace(/^\//, "")}</span> не существует в этом лендинге.
        </p>
        <button
          type="button"
          onClick={() => {
            window.location.href = "/";
          }}
          className="inline-flex items-center justify-center rounded-sm bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          Вернуться на главную
        </button>
      </div>
    </div>
  );
}
