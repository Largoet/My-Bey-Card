'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

// 👉 installe: npm i @zxing/browser
import { BrowserMultiFormatReader } from '@zxing/browser';

type Mode = 'qr' | 'manual' | 'nfc';

export default function ScanPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('qr');
  const [error, setError] = useState<string>('');
  const [info, setInfo] = useState<string>('');
  const [manualId, setManualId] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  // ---------- Helpers ----------
  function extractIdFromPayload(payload: string) {
    // On accepte soit un id_discord brut, soit une URL du type .../u/<id>
    try {
      if (payload.startsWith('http')) {
        const url = new URL(payload);
        const parts = url.pathname.split('/').filter(Boolean);
        const idIndex = parts.findIndex((p) => p === 'u');
        if (idIndex >= 0 && parts[idIndex + 1]) return parts[idIndex + 1];
      }
    } catch {}
    return payload; // fallback: considère le payload comme id_discord
  }

  function goToUserProfile(id: string) {
    if (!id) {
      setError('ID Discord introuvable dans le scan');
      return;
    }
    router.push(`/u/${id}?from=scan`);
  }

  // ---------- QR Mode ----------
  useEffect(() => {
    if (mode !== 'qr') {
      // stop cam si on quitte le mode
      stopCamera();
      return;
    }

    setError('');
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    (async () => {
      try {
        const video = videoRef.current!;
        setInfo('Ouverture de la caméra…');
        const controls = await codeReader.decodeFromVideoDevice(undefined, video, (result, err) => {
          if (result) {
            const text = result.getText();
            const id = extractIdFromPayload(text);
            stopCamera();
            goToUserProfile(id);
          }
          if (err) {
            // bruit normal pendant le scan, on ne spam pas l’UI
          }
        });
        setCameraActive(true);
        // on stocke controls pour pouvoir stop plus tard
        (video as any).__controls = controls;
        setInfo('Scanne un QR code de profil…');
      } catch (e: any) {
        setError(e?.message || 'Impossible d’accéder à la caméra');
        setInfo('');
      }
    })();

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function stopCamera() {
    try {
      const video = videoRef.current as any;
      if (video?.__controls) {
        video.__controls.stop();
        video.__controls = null;
      }
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      }
    } catch {}
    setCameraActive(false);
  }

  // ---------- NFC mode ----------
  useEffect(() => {
    setNfcSupported(typeof window !== 'undefined' && 'NDEFReader' in window);
  }, []);

  async function startNFC() {
    setError('');
    setInfo('Approche la carte NFC…');
    try {
      // @ts-ignore - Web NFC (Chrome Android)
      const ndef = new NDEFReader();
      await ndef.scan();
      ndef.onreading = (event: any) => {
        try {
          for (const record of event.message.records) {
            // On tente d’extraire un texte ou un lien
            if (record.recordType === 'text') {
              const textDecoder = new TextDecoder(record.encoding || 'utf-8');
              const str = textDecoder.decode(record.data);
              const id = extractIdFromPayload(str);
              goToUserProfile(id);
              return;
            }
            if (record.recordType === 'url') {
              const textDecoder = new TextDecoder();
              const url = textDecoder.decode(record.data);
              const id = extractIdFromPayload(url);
              goToUserProfile(id);
              return;
            }
          }
          setError('Carte lue, mais aucun ID/URL trouvé.');
        } catch (e: any) {
          setError(e?.message || 'Erreur de lecture NFC');
        }
      };
    } catch (e: any) {
      setError(e?.message || 'NFC non disponible ou refusé.');
      setInfo('');
    }
  }

  // ---------- Manual mode ----------
  function submitManual(e: React.FormEvent) {
    e.preventDefault();
    const id = manualId.trim();
    if (!id) return setError('Saisis un id_discord ou une URL /u/<id>.');
    goToUserProfile(extractIdFromPayload(id));
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Scanner un adversaire</h1>

      {/* Mode switch */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('qr')}
          className={`px-3 py-2 rounded ${mode === 'qr' ? 'bg-blue-600 text-white' : 'bg-neutral-800'}`}
        >
          QR Caméra
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`px-3 py-2 rounded ${mode === 'manual' ? 'bg-blue-600 text-white' : 'bg-neutral-800'}`}
        >
          Saisie manuelle
        </button>
        <button
          onClick={() => setMode('nfc')}
          className={`px-3 py-2 rounded ${mode === 'nfc' ? 'bg-blue-600 text-white' : 'bg-neutral-800'}`}
          disabled={!nfcSupported}
          title={nfcSupported ? 'Scanner une carte NFC' : 'NFC non supporté sur ce navigateur'}
        >
          NFC {nfcSupported ? '' : ' (non supporté)'}
        </button>
      </div>

      {/* Hints / errors */}
      {info && <p className="text-sm text-neutral-300 mb-3">{info}</p>}
      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

      {/* Panels */}
      {mode === 'qr' && (
        <div className="rounded-lg border border-neutral-700 p-4">
          <video ref={videoRef} className="w-full rounded" muted playsInline autoPlay />
          <div className="mt-3 flex justify-end">
            {cameraActive && (
              <button onClick={stopCamera} className="px-3 py-2 rounded bg-neutral-800">
                Arrêter la caméra
              </button>
            )}
          </div>
          <p className="mt-2 text-sm text-neutral-400">
            Astuce: Localhost fonctionne sans HTTPS pour la caméra. En prod, une origine **HTTPS** est requise.
          </p>
        </div>
      )}

      {mode === 'manual' && (
        <form onSubmit={submitManual} className="rounded-lg border border-neutral-700 p-4">
          <label className="block mb-2 text-sm">ID Discord **ou** URL profil (ex: https://…/u/123456)</label>
          <input
            className="w-full rounded bg-neutral-900 border border-neutral-700 px-3 py-2"
            placeholder="id_discord ou URL"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
          />
          <div className="mt-3">
            <button type="submit" className="px-3 py-2 rounded bg-blue-600">Aller au profil</button>
          </div>
        </form>
      )}

      {mode === 'nfc' && (
        <div className="rounded-lg border border-neutral-700 p-4">
          <p className="text-sm mb-3">
            NFC fonctionne sur **Android / Chrome** (HTTPS requis, ou localhost pour dev).
            Approche la carte pour lire l’ID/URL encodé.
          </p>
          <button
            onClick={startNFC}
            disabled={!nfcSupported}
            className="px-3 py-2 rounded bg-blue-600 disabled:opacity-50"
          >
            Démarrer le scan NFC
          </button>
        </div>
      )}
    </div>
  );
}
