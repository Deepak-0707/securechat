/**
 * ENCRYPTION DEMO PANEL - FOR PROFESSOR DEMONSTRATION
 * 
 * Location: frontend/src/components/Chat/EncryptionDemoPanel.jsx
 * 
 * This component shows:
 * 1. Your public key (stored in database)
 * 2. Your private key (stored in browser)
 * 3. Recipient's public key
 * 4. Shared secret computation
 * 5. Conversation key derivation
 * 6. Live encryption/decryption of messages
 * 
 * CREATE THIS AS A NEW FILE
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { userAPI } from '../../services/api.js';
import { 
  getMyKeys,
  computeSharedSecret,
  deriveConversationKey,
  getConversationKey,
  encryptMessage,
  decryptMessage 
} from '../../services/e2eEncryption.js';

export function EncryptionDemoPanel({ conversationId, recipientId, isOpen, onClose }) {
  const { user } = useAuth();
  const [demoData, setDemoData] = useState({
    myPublicKey: '',
    myPrivateKey: '',
    recipientPublicKey: '',
    sharedSecret: '',
    conversationKey: '',
    samplePlaintext: 'Hello, this is a test message!',
    sampleCiphertext: '',
    sampleNonce: '',
    decryptedText: ''
  });

  useEffect(() => {
    if (isOpen && conversationId && recipientId) {
      loadEncryptionDetails();
    }
  }, [isOpen, conversationId, recipientId]);

  const loadEncryptionDetails = async () => {
    try {
      // 1. Get my keys from browser localStorage
      const myKeys = getMyKeys();
      
      // 2. Get my public key from database (via API)
      const myPublicKeyResponse = await userAPI.getPublicKey(user.id || user._id);
      
      // 3. Get recipient's public key from database
      const recipientResponse = await userAPI.getPublicKey(recipientId);
      
      // 4. Compute shared secret
      const sharedSecret = computeSharedSecret(
        myKeys.privateKey,
        recipientResponse.data.publicKey
      );
      
      // 5. Derive conversation key
      const conversationKey = deriveConversationKey(sharedSecret, conversationId);
      
      // 6. Encrypt sample message
      const encrypted = encryptMessage(demoData.samplePlaintext, conversationKey);
      
      // 7. Decrypt it back
      const decrypted = decryptMessage(encrypted.ciphertext, encrypted.nonce, conversationKey);
      
      setDemoData({
        ...demoData,
        myPublicKey: myPublicKeyResponse.data.publicKey,
        myPrivateKey: myKeys.privateKey,
        recipientPublicKey: recipientResponse.data.publicKey,
        sharedSecret: sharedSecret,
        conversationKey: conversationKey,
        sampleCiphertext: encrypted.ciphertext,
        sampleNonce: encrypted.nonce,
        decryptedText: decrypted
      });
      
    } catch (error) {
      console.error('Failed to load encryption details:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <h2 style={styles.title}>🔐 End-to-End Encryption Demonstration</h2>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>
        
        <div style={styles.content}>
          
          {/* Step 1: Key Pair */}
          <Section title="1️⃣ My Key Pair (ECDH X25519)">
            <KeyDisplay 
              label="Public Key (stored in MongoDB)" 
              value={demoData.myPublicKey}
              hint="✅ This is stored in your User document in MongoDB"
              onCopy={() => copyToClipboard(demoData.myPublicKey)}
            />
            <KeyDisplay 
              label="Private Key (stored in browser localStorage)" 
              value={demoData.myPrivateKey}
              hint="🔒 This NEVER leaves your browser - completely private!"
              onCopy={() => copyToClipboard(demoData.myPrivateKey)}
              sensitive
            />
          </Section>

          {/* Step 2: Recipient Public Key */}
          <Section title="2️⃣ Recipient's Public Key">
            <KeyDisplay 
              label="Fetched from MongoDB" 
              value={demoData.recipientPublicKey}
              hint="✅ Retrieved from recipient's User document"
              onCopy={() => copyToClipboard(demoData.recipientPublicKey)}
            />
          </Section>

          {/* Step 3: Shared Secret */}
          <Section title="3️⃣ Shared Secret Computation (ECDH)">
            <div style={styles.formula}>
              <code>SharedSecret = ECDH(MyPrivateKey, RecipientPublicKey)</code>
            </div>
            <KeyDisplay 
              label="Computed Shared Secret" 
              value={demoData.sharedSecret}
              hint="🔐 Both parties compute the SAME secret without transmitting it!"
              onCopy={() => copyToClipboard(demoData.sharedSecret)}
              sensitive
            />
          </Section>

          {/* Step 4: Conversation Key */}
          <Section title="4️⃣ Conversation Key Derivation">
            <div style={styles.formula}>
              <code>ConversationKey = HKDF(SharedSecret, ConversationID)</code>
            </div>
            <KeyDisplay 
              label="Derived Conversation Key" 
              value={demoData.conversationKey}
              hint="🔑 Unique key for this specific conversation"
              onCopy={() => copyToClipboard(demoData.conversationKey)}
              sensitive
            />
          </Section>

          {/* Step 5: Encryption Demo */}
          <Section title="5️⃣ Message Encryption (XSalsa20-Poly1305)">
            <div style={styles.messageDemo}>
              <div style={styles.demoRow}>
                <strong>Original Message:</strong>
                <div style={styles.messageBox}>{demoData.samplePlaintext}</div>
              </div>
              
              <div style={styles.arrow}>⬇️ ENCRYPT</div>
              
              <div style={styles.demoRow}>
                <strong>Ciphertext:</strong>
                <div style={styles.cipherBox}>
                  {demoData.sampleCiphertext.substring(0, 100)}...
                  <button onClick={() => copyToClipboard(demoData.sampleCiphertext)} style={styles.copyBtn}>
                    Copy Full
                  </button>
                </div>
              </div>
              
              <div style={styles.demoRow}>
                <strong>Nonce (random):</strong>
                <div style={styles.cipherBox}>{demoData.sampleNonce}</div>
              </div>
              
              <div style={styles.arrow}>⬇️ DECRYPT</div>
              
              <div style={styles.demoRow}>
                <strong>Decrypted Message:</strong>
                <div style={styles.messageBox}>{demoData.decryptedText}</div>
              </div>
              
              {demoData.decryptedText === demoData.samplePlaintext && (
                <div style={styles.successBadge}>
                  ✅ Perfect match! Encryption/Decryption working correctly!
                </div>
              )}
            </div>
          </Section>

          {/* MongoDB Instructions */}
          <Section title="📊 How to View in MongoDB">
            <div style={styles.instructions}>
              <h4>To show your professor the public keys in MongoDB:</h4>
              <ol>
                <li>Go to your MongoDB Atlas dashboard</li>
                <li>Click "Browse Collections"</li>
                <li>Select your database</li>
                <li>Open the <code>users</code> collection</li>
                <li>Find your user document</li>
                <li>Look for the <code>publicKey</code> field</li>
              </ol>
              <p style={styles.note}>
                ⚠️ Note: Private keys are NOT in the database - they're only in browser localStorage for security!
              </p>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

function KeyDisplay({ label, value, hint, onCopy, sensitive = false }) {
  const [show, setShow] = useState(!sensitive);
  
  return (
    <div style={styles.keyDisplay}>
      <label style={styles.label}>{label}</label>
      <div style={styles.keyBox}>
        <code style={styles.keyText}>
          {show ? value : '••••••••••••••••••••••••••••••••'}
        </code>
        <div style={styles.keyActions}>
          {sensitive && (
            <button onClick={() => setShow(!show)} style={styles.toggleBtn}>
              {show ? '🙈 Hide' : '👁️ Show'}
            </button>
          )}
          <button onClick={onCopy} style={styles.copyBtn}>
            📋 Copy
          </button>
        </div>
      </div>
      {hint && <p style={styles.hint}>{hint}</p>}
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: '20px'
  },
  panel: {
    background: 'white',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    padding: '20px',
    borderBottom: '2px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    color: '#333'
  },
  closeButton: {
    background: '#ff4444',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    fontSize: '20px'
  },
  content: {
    padding: '20px',
    overflowY: 'auto',
    flex: 1
  },
  section: {
    marginBottom: '30px',
    padding: '20px',
    background: '#f9f9f9',
    borderRadius: '8px',
    border: '2px solid #e0e0e0'
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '15px',
    fontSize: '18px',
    color: '#2196F3'
  },
  keyDisplay: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#555'
  },
  keyBox: {
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px'
  },
  keyText: {
    flex: 1,
    fontSize: '12px',
    wordBreak: 'break-all',
    color: '#333',
    fontFamily: 'monospace'
  },
  keyActions: {
    display: 'flex',
    gap: '8px'
  },
  toggleBtn: {
    background: '#ff9800',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  copyBtn: {
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  hint: {
    marginTop: '8px',
    fontSize: '12px',
    color: '#666',
    fontStyle: 'italic'
  },
  formula: {
    background: '#fff3cd',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '12px',
    border: '1px solid #ffc107'
  },
  messageDemo: {
    background: '#fff',
    padding: '15px',
    borderRadius: '6px',
    border: '1px solid #ddd'
  },
  demoRow: {
    marginBottom: '12px'
  },
  messageBox: {
    background: '#e3f2fd',
    padding: '12px',
    borderRadius: '6px',
    marginTop: '8px',
    border: '1px solid #2196F3'
  },
  cipherBox: {
    background: '#fff3e0',
    padding: '12px',
    borderRadius: '6px',
    marginTop: '8px',
    border: '1px solid #ff9800',
    wordBreak: 'break-all',
    fontFamily: 'monospace',
    fontSize: '11px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px'
  },
  arrow: {
    textAlign: 'center',
    fontSize: '20px',
    margin: '15px 0',
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  successBadge: {
    background: '#4CAF50',
    color: 'white',
    padding: '12px',
    borderRadius: '6px',
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: '15px'
  },
  instructions: {
    background: '#fff',
    padding: '15px',
    borderRadius: '6px'
  },
  note: {
    background: '#fff3cd',
    padding: '10px',
    borderRadius: '4px',
    marginTop: '10px',
    border: '1px solid #ffc107'
  }
};