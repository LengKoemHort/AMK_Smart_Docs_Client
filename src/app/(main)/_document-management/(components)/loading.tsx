import React from "react";

interface LoadingProps {
  isVectorProcessed?: boolean;
}

export default function Loading({ isVectorProcessed }: LoadingProps) {
  // const [loading, setLoading] = useState(true);
  // useEffect(() => {
  //   const timer = setTimeout(() => setLoading(false), 20200);
  //   return () => clearTimeout(timer);
  // }, []);

  // if (!loading) return null;

  if (isVectorProcessed)
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="badge badge-soft badge-success px-2">
          <div className="tooltip" data-tip="Document is ready to ask question">
            <button className="">Ready</button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="badge badge-soft badge-error px-2">
          <div
            className="tooltip"
            data-tip="Document is processing in the server."
          >
            <button className="">Processing</button>
          </div>
        </div>
      </div>
    </div>
  );
}
