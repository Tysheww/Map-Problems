import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import './MapPage.css';

// Фікс іконок Leaflet для Vite
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- КОМПОНЕНТ ДЛЯ МАРКЕРА (Лайки та Коментарі) ---
function IssueMarker({ issue, onUpdate }) {
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('Денис'); 

  const handleUpvote = () => {
    axios.put(`http://localhost:5023/api/Issues/${issue.id}/upvote`)
      .then(response => onUpdate({ ...issue, upvotes: response.data.upvotes }))
      .catch(error => console.error("Помилка голосування:", error));
  };

  const handleCommentSubmit = () => {
    if (!commentText) return;
    axios.post(`http://localhost:5023/api/Issues/${issue.id}/comments`, { text: commentText, authorName })
    .then(response => {
      const updatedComments = [...(issue.comments || []), response.data];
      onUpdate({ ...issue, comments: updatedComments });
      setCommentText('');
    })
    .catch(error => console.error("Помилка коментування:", error));
  };

  return (
    <Marker position={[issue.latitude, issue.longitude]}>
      <Popup minWidth={250}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{ margin: 0, color: '#d32f2f' }}>{issue.title}</h3>
          <p style={{ margin: 0 }}><strong>Категорія:</strong> {issue.category}</p>
          <p style={{ margin: 0 }}>{issue.description}</p>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 'bold' }}>Голосів: {issue.upvotes}</span>
            <button onClick={handleUpvote} style={{ cursor: 'pointer', padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
              👍 Підтримати
            </button>
          </div>

          <div style={{ maxHeight: '100px', overflowY: 'auto', marginTop: '5px' }}>
            <h4 style={{ margin: '0 0 5px 0' }}>Коментарі:</h4>
            {!issue.comments || issue.comments.length === 0 ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Ще немає коментарів.</p>
            ) : (
              issue.comments.map(c => (
                <div key={c.id} style={{ backgroundColor: '#f8f9fa', padding: '5px', borderRadius: '4px', marginBottom: '5px', fontSize: '12px' }}>
                  <strong>{c.authorName}:</strong> {c.text}
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
            <input type="text" placeholder="Коментар..." value={commentText} onChange={(e) => setCommentText(e.target.value)} style={{ flex: 1, padding: '4px' }} />
            <button onClick={handleCommentSubmit} style={{ cursor: 'pointer', padding: '4px 8px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>➤</button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// --- ГОЛОВНИЙ КОМПОНЕНТ СТОРІНКИ КАРТИ ---
function MapPage() {
  const navigate = useNavigate(); // Для кнопки "Назад"
  const [issues, setIssues] = useState([]);
  const [draftPosition, setDraftPosition] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Дороги / Ями');
  const [photoFile, setPhotoFile] = useState(null); // Стан для зберігання вибраного файлу

  useEffect(() => {
    axios.get('http://localhost:5023/api/Issues')
      .then(response => setIssues(response.data))
      .catch(error => console.error("Помилка:", error));
  }, []);

  const MapClickHandler = () => {
    useMapEvents({
      click(e) { setDraftPosition([e.latlng.lat, e.latlng.lng]); },
    });
    return null;
  };

  const handleSubmit = () => {
    if (!newTitle || !newDescription) return alert("Заповніть усі поля!");

    const formData = new FormData();
    
    // ВАЖЛИВО: Ключі тепер з великої літери, щоб C# їх впізнав!
    formData.append('Title', newTitle);
    formData.append('Description', newDescription);
    formData.append('Category', newCategory);
    formData.append('Latitude', draftPosition[0].toString().replace(',', '.'));
    formData.append('Longitude', draftPosition[1].toString().replace(',', '.'));
    
    // Файл передаємо з маленької літери 'photo'
    if (photoFile) {
      formData.append('photo', photoFile); 
    }

    // ВАЖЛИВО: Ми прибрали ручний хедер Content-Type. Axios зробить це сам!
    axios.post('http://localhost:5023/api/Issues', formData)
    .then(response => {
      setIssues([...issues, response.data]);
      setDraftPosition(null); 
      setNewTitle(''); 
      setNewDescription('');
      setPhotoFile(null); // Очищаємо файл
      alert("Звернення успішно створено!");
    })
    .catch(error => {
        console.error("Деталі помилки:", error);
        alert("Помилка відправки! Перевір консоль (F12).");
    });
  };

  const handleUpdateIssue = (updatedIssue) => {
    setIssues(issues.map(iss => iss.id === updatedIssue.id ? updatedIssue : iss));
  };

  const cityCenter = [50.2547, 28.6586];

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      
      {/* ПЛАВАЮЧА КНОПКА ПОВЕРНЕННЯ */}
      <div className="map-toolbar">
        <button 
          className="floating-back-btn" 
          onClick={() => navigate('/')}
          style={{ display: 'block' }} // Примусово показуємо кнопку
        >
          Повернутися в меню
        </button>
      </div>

      {/* КАРТА З ЖОРСТКОЮ ВИСОТОЮ 100vh */}
      <MapContainer center={cityCenter} zoom={13} style={{ height: '100vh', width: '100vw' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />

        {issues.map(issue => (
          <IssueMarker key={issue.id} issue={issue} onUpdate={handleUpdateIssue} />
        ))}

        {draftPosition && (
          <Popup position={draftPosition} onClose={() => setDraftPosition(null)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '220px' }}>
              <h3 style={{ margin: 0, borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Нова проблема</h3>
              <input type="text" placeholder="Коротка назва" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={{ padding: '5px' }} />
              <textarea placeholder="Опис проблеми..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows="3" style={{ padding: '5px', resize: 'vertical' }} />
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{ padding: '5px' }}>
                <option value="Дороги / Ями">Дороги / Ями</option>
                <option value="Освітлення">Освітлення</option>
                <option value="Сміття">Сміття</option>
                <option value="Водоканал">Водоканал</option>
                <option value="Пошкодження від прильотів">Пошкодження від прильотів</option>
                <option value="Інше">Інше</option>
              </select>

              <label style={{ fontWeight: 'bold', fontSize: '11px', display: 'block', marginTop: '5px' }}>
                ФОТО ПРОБЛЕМИ
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setPhotoFile(e.target.files[0])} 
                style={{ marginTop: '3px', width: '100%' }}
              />
              
              <button onClick={handleSubmit} style={{ cursor: 'pointer', padding: '8px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Відправити</button>
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
}

export default MapPage;