const fs = require('fs');

let content = fs.readFileSync('src/components/SubmissionsPanel.tsx', 'utf8');

const newSection = `            {/* Archivos Adjuntos del Estudiante */}
            {(selectedSubmission.drawing || selectedSubmission.files) && (
              <div className="p-4 border-t border-dark-600">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" /> Archivos Adjuntos
                </h4>
                <div className="space-y-2">
                  {selectedSubmission.drawing && selectedSubmission.drawing !== '[Dibujo muy grande - no guardado]' && (
                    <a href={selectedSubmission.drawing} download className="flex items-center gap-2 p-3 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg border border-purple-500/30">
                      <Download className="w-5 h-5 text-purple-400" />
                      <span className="text-sm text-purple-300">Descargar dibujo</span>
                    </a>
                  )}
                  {selectedSubmission.files && (() => { try { return JSON.parse(selectedSubmission.files).map((f: {name: string, url?: string}, i: number) => f.url ? <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg border border-blue-500/30"><Download className="w-5 h-5 text-blue-400" /><span className="text-sm text-blue-300">{f.name}</span></a> : null) } catch { return null } })()}
                </div>
              </div>
            )}

            {/* Grading Section */}`;

content = content.replace('            {/* Grading Section */}', newSection);

fs.writeFileSync('src/components/SubmissionsPanel.tsx', content);
console.log('File updated successfully');
