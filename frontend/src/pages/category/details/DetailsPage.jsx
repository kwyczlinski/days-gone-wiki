import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { CommentsBox } from "../../../components/comments/CommentsBox";
import { toast } from "react-toastify";
import { Navbar } from "../../../components/navbar";

const API_URL = window._env_?.VITE_API_URL || import.meta.env.VITE_API_URL;

const WikiSection = ({ title, items, type }) => {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h3>{title}</h3>
      <ul>
        {items?.map((it) => (
          <li key={it.id}>
            <Link to={`/${type}/${it.id}`}>{it.name}</Link>
            {it.main !== undefined && (it.main ? " (Main)" : " (Side)")}
          </li>
        ))}
      </ul>
    </div>
  );
};

const categoryContent = {
  region: (data) => {
    return (
      <div className="region-grid">
        <WikiSection title="Camps" items={data.camps || []} type="camp" />
        <WikiSection
          title="Missions"
          items={data.missions || []}
          type="mission"
        />
        <WikiSection title="Hordes" items={data.hordes || []} type="horde" />
        <WikiSection
          title="Infestation Zones"
          items={data.infestations}
          type="infestation"
        />
        <WikiSection
          title="Collectibles"
          items={data.collectibles}
          type="collectible"
        />
      </div>
    );
  },

  camp: (data) => <div>{data.description && <p>{data.description}</p>}</div>,
  collectible: (data) => data.description && <p>{data.description}</p>,

  merchant: (data) => {
    if (!data || !data.items) return <p>Loading...</p>;
    return (
      <div>
        <h3>Inventory</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
              <th>Trust</th>
              <th>Condition</th>
              <th>Consumable</th>
            </tr>
          </thead>
          <tbody>
            {data.items?.map((it, i) => (
              <tr key={i}>
                <td>{it.item}</td>
                <td>{it.price}</td>
                <td>{it.trust}</td>
                <td>{it.condition}</td>
                <td>{it.consumable ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },

  mechanic: (data) => {
    if (!data || !data.upgrades) return <p>Loading...</p>;
    return (
      <div>
        <h3>Bike upgrades</h3>
        <table>
          <thead>
            <tr>
              <th>Upgrade</th>
              <th>Price</th>
              <th>Trust</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {data.upgrades?.map((up, i) => (
              <tr key={i}>
                <td>{up.upgrade}</td>
                <td>{up.price}</td>
                <td>{up.trust}</td>
                <td>{up.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },

  horde: (data) => (
    <div>
      <p>Horde size {data.size}</p>
    </div>
  ),

  infestation: (data) => (
    <div>
      <p>Number of nests {data.nr_nests}</p>
    </div>
  ),

  mission: (data) => (
    <div>
      <p>{data.main ? "Main" : "Side"} mission</p>
      {data.start_time && <p>Starts at {data.start_time}</p>}
      <h3>Objective</h3>
      {data.description && <p>{data.description}</p>}

      <div>
        {data.previous_missions && (
          <div>
            <h4>Previous Missions:</h4>
            <ul>
              {data.previous_missions?.map((m) => (
                <li key={m.id}>
                  <Link to={`/mission/${m.id}`}>{m.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.next_missions && (
          <div>
            <h4>Next Missions:</h4>
            <ul>
              {data.next_missions?.map((m) => (
                <li key={m.id}>
                  <Link to={`/mission/${m.id}`}>{m.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  ),
};

export const DetailsPage = () => {
  const { category, id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleShowDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/${category}/${id}`);
        if (!res.ok) throw new Error("Not found");
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.log(err);
        toast.error("An error occured, please refresh");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    handleShowDetails();

    return () => {
      setData(null);
    };
  }, [category, id]);

  if (loading) return <p>Loading...</p>;

  if (!data) return <div style={{padding: "20px"}}><h3>Nie udało się załadować danych.</h3><Link to="/">Powrót</Link></div>;

  const pageTitle =
    category === "mechanic" || category === "merchant"
      ? `${data.name || data.camp_name} ${
          category.charAt(0).toUpperCase() + category.slice(1)
        }`
      : data.name || data.region_name || data.mission_name;

  return (
    <div key={`${category}-${id}`}>
      <Navbar />
      <header>
        <h1>{pageTitle}</h1>
        {category === "mission" && (
          <span>{data.main ? "Main Story" : "Side Activity"}</span>
        )}
      </header>
      <main>
        {categoryContent[category] ? (
          categoryContent[category](data)
        ) : (
          <p>No details found.</p>
        )}
      </main>
      {["mission", "horde", "infestation"].includes(category) && (
        <section>
          <h3>Rewards</h3>
          {!(data.xp || data.trust || data.credits) ? (
            <p>No rewards associated with this entry.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  {data.xp && <th>XP</th>}
                  {data.trust && <th>Trust</th>}
                  {data.credits && <th>Credits</th>}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {data.xp && <td>{data.xp}</td>}
                  {data.trust && <td>{data.trust}</td>}
                  {data.credits && <td>{data.credits}</td>}
                </tr>
              </tbody>
            </table>
          )}
        </section>
      )}

      <footer>
        <hr />
        {category !== "region" && data.region_id && (
          <>
            <h3>Related</h3>
            <p>
              Region:{" "}
              <Link to={`/region/${data.region_id}`}>{data.region_name}</Link>
            </p>
          </>
        )}
        {data.camp_id && category !== "camp" && (
          <p>
            Related Camp:{" "}
            <Link to={`/camp/${data.camp_id}`}>{data.camp_name}</Link>
          </p>
        )}
        {category === "camp" && (
          <div>
            {data.has_merchant && (
              <p>
                Merchant:{" "}
                <Link to={`/merchant/${id}`}>
                  {data.name || data.camp_name} merchant
                </Link>
              </p>
            )}
            {data.has_mechanic && (
              <p>
                Mechanic:{" "}
                <Link to={`/mechanic/${id}`}>
                  {data.name || data.camp_name} mechanic
                </Link>
              </p>
            )}
          </div>
        )}
      </footer>
      <hr />
      <CommentsBox category={category} itemId={id} />
    </div>
  );
};
